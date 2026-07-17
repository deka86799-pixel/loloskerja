-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  avatar_url text,
  target_industry text,
  target_position text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'lifetime')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create CVs table
create table if not exists public.cvs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  template_name text not null,
  profile_info jsonb default '{}'::jsonb not null,
  summary text,
  experience jsonb default '[]'::jsonb not null,
  education jsonb default '[]'::jsonb not null,
  skills jsonb default '[]'::jsonb not null,
  certifications jsonb default '[]'::jsonb not null,
  achievements jsonb default '[]'::jsonb not null,
  languages jsonb default '[]'::jsonb not null,
  organizations jsonb default '[]'::jsonb not null,
  portfolio jsonb default '[]'::jsonb not null,
  ats_score integer default 0 not null,
  is_published boolean default false not null,
  version integer default 1 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Cover Letters table
create table if not exists public.cover_letters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  company_name text not null,
  position text not null,
  job_description text not null,
  tone text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Tracker Applications table
create table if not exists public.applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  company_name text not null,
  position text not null,
  status text default 'wishlist' check (status in ('wishlist', 'applied', 'interview', 'offer', 'accepted', 'rejected')),
  applied_date date not null,
  cv_id uuid references public.cvs(id) on delete set null,
  salary numeric,
  notes text,
  follow_up_date date,
  attachments jsonb default '[]'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Professional Photos table
create table if not exists public.professional_photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  original_url text not null,
  generated_urls text[] not null,
  outfit text not null,
  background text not null,
  lighting text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Interview Prep sessions table
create table if not exists public.interview_preps (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  position text not null,
  company_name text not null,
  job_description text not null,
  experience_level text not null,
  interview_type text not null,
  qa_data jsonb default '[]'::jsonb not null,
  interviewer_questions jsonb default '[]'::jsonb not null,
  tips jsonb default '[]'::jsonb not null,
  practice_sessions jsonb default '[]'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.cvs enable row level security;
alter table public.cover_letters enable row level security;
alter table public.applications enable row level security;
alter table public.professional_photos enable row level security;
alter table public.interview_preps enable row level security;

-- Drop existing policies if any to avoid errors
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can perform all actions on own CVs" on public.cvs;
drop policy if exists "Users can perform all actions on own Cover Letters" on public.cover_letters;
drop policy if exists "Users can perform all actions on own Applications" on public.applications;
drop policy if exists "Users can perform all actions on own Photos" on public.professional_photos;
drop policy if exists "Users can perform all actions on own Interview Preps" on public.interview_preps;

-- Setup policies
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can perform all actions on own CVs" on public.cvs for all using (auth.uid() = user_id);
create policy "Users can perform all actions on own Cover Letters" on public.cover_letters for all using (auth.uid() = user_id);
create policy "Users can perform all actions on own Applications" on public.applications for all using (auth.uid() = user_id);
create policy "Users can perform all actions on own Photos" on public.professional_photos for all using (auth.uid() = user_id);
create policy "Users can perform all actions on own Interview Preps" on public.interview_preps for all using (auth.uid() = user_id);
