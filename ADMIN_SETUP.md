# Admin Dashboard Setup Guide

Your admin dashboard is now ready! Here's how to set it up and use it.

## Accessing the Admin Dashboard

Visit `/admin` or click the "Admin" link in the footer of your recruiting page.

## First-Time Setup

### Step 1: Create an Admin User

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** > **Users**
4. Click **Add User** or **Invite User**
5. Enter your admin email and a secure password
6. Click **Create User**

### Step 2: Grant Admin Permissions

After creating the user, you need to mark them as an admin:

1. In the Supabase Dashboard, go to **SQL Editor**
2. Run this query (replace with your admin email):

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'your-admin-email@example.com';
```

3. Click **Run**

### Step 3: Sign In

1. Go to `/admin` on your site
2. Enter your admin email and password
3. You'll be redirected to the admin dashboard

## Admin Dashboard Features

### Application Management
- **View All Applications**: See every submission with key details
- **Search**: Find applications by name, email, phone, or message content
- **Filter by Status**: View applications by their current status (new, contacted, scheduled, interviewed, hired, rejected)
- **Sort**: Order applications by newest, oldest, or alphabetically by name

### Application Details
- **Full Information**: View complete applicant details including contact info and messages
- **Video Submissions**: Watch video introductions submitted by applicants
- **Status Updates**: Change application status (new → contacted → scheduled → interviewed → hired/rejected)
- **Internal Notes**: Add private notes about each applicant for team reference
- **Contact Links**: Quick email and phone links to reach out to applicants

### Status Types
- **new**: Freshly submitted, not yet reviewed
- **contacted**: You've reached out to the applicant
- **scheduled**: Interview has been scheduled
- **interviewed**: Interview completed, pending decision
- **hired**: Applicant accepted for the position
- **rejected**: Applicant not moving forward

## Tips for Using the Dashboard

1. **Regular Reviews**: Check the dashboard daily for new applications
2. **Status Management**: Keep statuses updated so your team knows where each applicant stands
3. **Take Notes**: Use the notes field to record important details from calls or interviews
4. **Watch Videos**: Review video submissions to get a better sense of applicants' personalities
5. **Quick Actions**: Use the email and phone links to quickly reach out to promising candidates

## Security

- Only users with admin privileges can access the dashboard
- All application data is protected by Row Level Security (RLS)
- Videos are stored securely in Supabase Storage
- Admin status is verified on every request

## Need Help?

If you have issues accessing the admin dashboard:
1. Verify you created the user in Supabase Authentication
2. Confirm you ran the SQL query to grant admin permissions
3. Try signing out and signing back in
4. Check your browser console for any error messages
