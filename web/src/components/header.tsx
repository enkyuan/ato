"use client";

import { Link } from 'waku';
import { Logo } from './logo';
import { UserProfile } from './auth/user-profile';
import db from '../lib/instant/client';

export const Header = () => {
  return (
    <header className="flex items-center justify-between gap-4 p-6 lg:fixed lg:left-0 lg:top-0 lg:right-0 lg:z-50">
      <h2 className="flex flex-row items-center gap-4 text-lg font-bold tracking-tight">
        <Logo width={42} height={42} className='rounded-md' />
        <Link className="text-2xl font-normal text-primary" style={{ fontFamily: "'Gasoek One', sans-serif" }} to="/">
          ato
        </Link>
      </h2>
      
      <db.SignedIn>
        <UserProfile />
      </db.SignedIn>
    </header>
  );
};
