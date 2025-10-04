// lib/auth0.ts

import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize the Auth0 client with onCallback hook
export const auth0 = new Auth0Client({
  // Options are loaded from environment variables by default
  // Ensure necessary environment variables are properly set
  // domain: process.env.AUTH0_DOMAIN,
  // clientId: process.env.AUTH0_CLIENT_ID,
  // clientSecret: process.env.AUTH0_CLIENT_SECRET,
  // appBaseUrl: process.env.APP_BASE_URL,
  // secret: process.env.AUTH0_SECRET,

  authorizationParameters: {
    // In v4, the AUTH0_SCOPE and AUTH0_AUDIENCE environment variables for API authorized applications are no longer automatically picked up by the SDK.
    // Instead, we need to provide the values explicitly.
    scope: process.env.AUTH0_SCOPE || 'openid profile email',
    audience: process.env.AUTH0_AUDIENCE,
  },

  // Hook that runs after successful authentication
  async onCallback(error, context, session) {
    if (error) {
      console.error('Auth0 callback error:', error);
      return NextResponse.redirect(
        new URL(`/error?error=${error.message}`, process.env.APP_BASE_URL)
      );
    }

    if (session?.user) {
      console.log('User logged in, syncing to Supabase:', session.user.sub);
      
      try {
        // Create Supabase client for this callback
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
              detectSessionInUrl: false
            }
          }
        );

        const user = session.user;
        const auth0Id = user.sub;

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('auth0_id', auth0Id)
          .single();

        const userData = {
          auth0_id: auth0Id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          email_verified: user.email_verified || false,
          updated_at: new Date().toISOString()
        };

        if (existingUser) {
          // Update existing user
          console.log('Updating existing user in Supabase');
          await supabase
            .from('users')
            .update(userData)
            .eq('auth0_id', auth0Id);
        } else {
          // Create new user
          console.log('Creating new user in Supabase');
          await supabase
            .from('users')
            .insert({
              ...userData,
              created_at: new Date().toISOString()
            });
        }

        console.log('User successfully synced to Supabase');
      } catch (supabaseError) {
        // Log the error but don't block the login
        console.error('Error syncing user to Supabase:', supabaseError);
      }
    }

    // Complete the redirect to the provided returnTo URL
    return NextResponse.redirect(
      new URL(context.returnTo || '/', process.env.APP_BASE_URL)
    );
  }
});