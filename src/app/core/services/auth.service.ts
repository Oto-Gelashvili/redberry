import { Injectable, signal, computed } from '@angular/core';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  fullName: string | null;
  mobileNumber: string | null;
  age: number | null;
  profileComplete: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  private _session = signal<Session | null>(null);

  user = this._user.asReadonly();
  // kept so your other services still compile until we migrate them
  token = computed(() => this._session()?.access_token ?? null);
  isAuthenticated = computed(() => !!this._session());

  constructor() {
    supabase.auth.onAuthStateChange((event, session) => {
      this._session.set(session);

      if (!session) {
        this._user.set(null);
        return;
      }
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        setTimeout(() => this.loadProfile(session.user), 0);
      }
    });
  }

  private async loadProfile(authUser: SupabaseUser) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error || !data) return;

    this._user.set({
      id: data.id,
      username: data.username,
      email: authUser.email!,
      avatar: data.avatar,
      fullName: data.full_name,
      mobileNumber: data.mobile_number,
      age: data.age,
      profileComplete: data.profile_complete,
    });
  }

  updateUser(user: User) {
    this._user.set(user);
  }

  async logIn(credentials: { email: string; password: string }) {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      // keep the shape your LogIn component already expects
      throw { status: 401, error: { message: error.message } };
    }
    await this.loadProfile(data.user);
  }

  async logout() {
    await supabase.auth.signOut();
    // onAuthStateChange clears the signals
  }

  async register(formData: FormData) {
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const avatar = formData.get('avatar') as File | null;

    // 1. username taken?
    const { data: available, error: rpcError } = await supabase.rpc('is_username_available', {
      name: username,
    });
    if (rpcError) throw { status: 500, error: rpcError };
    if (!available) {
      throw { status: 422, error: { errors: { username: ['Username is already taken'] } } };
    }

    // 2. create the account (trigger creates the profile row)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    if (error) {
      if (error.code === 'user_already_exists') {
        throw { status: 422, error: { errors: { email: ['Email is already registered'] } } };
      }
      throw { status: error.status ?? 500, error };
    }
    if (!data.session || !data.user) {
      throw { status: 500, error: { message: 'Disable "Confirm email" in Supabase for now.' } };
    }

    // 3. avatar (optional)
    if (avatar && avatar.size > 0) {
      const ext = avatar.name.split('.').pop();
      const path = `${data.user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, avatar, { upsert: true });

      if (!upErr) {
        const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
        await supabase
          .from('profiles')
          .update({ avatar: `${pub.publicUrl}?v=${Date.now()}` }) // cache-bust on re-upload
          .eq('id', data.user.id);
      }
    }

    await this.loadProfile(data.user);
  }

  // Plain object instead of FormData. I haven't seen your profile component yet.
  async updateProfile(values: {
    fullName: string;
    mobileNumber: string;
    age: number;
    avatar?: File | null;
  }) {
    const userId = this._session()?.user.id;
    if (!userId) throw { status: 401, error: { message: 'Not logged in' } };

    let avatarUrl: string | undefined;
    if (values.avatar) {
      const ext = values.avatar.name.split('.').pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, values.avatar, { upsert: true });
      if (upErr) throw { status: 400, error: upErr };
      avatarUrl = `${supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: values.fullName,
        mobile_number: values.mobileNumber,
        age: values.age,
        ...(avatarUrl && { avatar: avatarUrl }),
      })
      .eq('id', userId);

    if (error) throw { status: 400, error };
    await this.loadProfile(this._session()!.user);
  }
}
