-- Create profiles table
create table profiles (
  id uuid references auth.users primary key,
  username text unique,
  avatar_url text,
  bio text,
  location text,
  gender text,
  birth_date date,
  interests text[],
  telegram_id text,
  is_premium boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create matches table
create table matches (
  id uuid default uuid_generate_v4() primary key,
  user1_id uuid references profiles(id),
  user2_id uuid references profiles(id),
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create conversations table
create table conversations (
  id uuid default uuid_generate_v4() primary key,
  match_id uuid references matches(id),
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz default now()
);

-- Create messages table
create table messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations(id),
  sender_id uuid references profiles(id),
  content text,
  message_type text default 'text',
  read_at timestamptz,
  created_at timestamptz default now()
);

-- Create likes table
create table likes (
  id uuid default uuid_generate_v4() primary key,
  from_user uuid references profiles(id),
  to_user uuid references profiles(id),
  created_at timestamptz default now(),
  unique(from_user, to_user)
);

-- Create notifications table
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id),
  type text,
  content text,
  read boolean default false,
  data jsonb,
  created_at timestamptz default now()
);

-- Create policies
alter table profiles enable row level security;
alter table matches enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table likes enable row level security;
alter table notifications enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Matches policies
create policy "Users can view their own matches"
  on matches for select
  using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Users can create matches"
  on matches for insert
  with check (auth.uid() = user1_id);

-- Messages policies
create policy "Users can view messages in their conversations"
  on messages for select
  using (
    sender_id = auth.uid() or
    conversation_id in (
      select id from conversations
      where match_id in (
        select id from matches
        where user1_id = auth.uid() or user2_id = auth.uid()
      )
    )
  );

create policy "Users can insert messages in their conversations"
  on messages for insert
  with check (
    sender_id = auth.uid() and
    conversation_id in (
      select id from conversations
      where match_id in (
        select id from matches
        where user1_id = auth.uid() or user2_id = auth.uid()
      )
    )
  );
