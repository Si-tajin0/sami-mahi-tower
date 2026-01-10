// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // ১. কুকি থেকে ইউজার রোল সংগ্রহ করা
  const userRole = request.cookies.get('user-role')?.value;
  const { pathname } = request.nextUrl;

  // ২. সিকিউর ফোল্ডারগুলোর লিস্ট
  const managerPath = pathname.startsWith('/manager');
  const ownerPath = pathname.startsWith('/owner');
  const tenantPath = pathname.startsWith('/tenant');

  // ৩. যদি লগইন না থাকে তবে লগইন পেজে পাঠিয়ে দাও
  if ((managerPath || ownerPath || tenantPath) && !userRole) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ৪. রোল অনুযায়ী এক্সেস কন্ট্রোল (ম্যানেজার ওনার প্যানেলে ঢুকতে পারবে না)
  if (ownerPath && userRole !== 'owner') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (managerPath && userRole !== 'manager') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ভাড়াটিয়া শুধুমাত্র নিজের ড্যাশবোর্ডেই ঢুকতে পারবে (ঐচ্ছিক কড়া নিরাপত্তা)
  if (tenantPath && userRole !== 'tenant') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// কোন কোন ইউআরএল-এ এই গার্ড কাজ করবে
export const config = {
  matcher: [
    '/manager/:path*', 
    '/owner/:path*', 
    '/tenant/:path*'
  ],
};