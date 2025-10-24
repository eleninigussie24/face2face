# 🚀 Production Setup - Step by Step Guide

## Progress Tracker
- [ ] Step 1: Google OAuth Credentials (15 min)
- [ ] Step 2: SendGrid Email Service (15 min)
- [ ] Step 3: Privacy Policy Page (30 min)
- [ ] Step 4: Test Everything (10 min)
- [ ] Step 5: Deploy & Launch! (5 min)

---

# STEP 1: Google OAuth Credentials (15 min)

## ✅ What You'll Achieve:
Your app will show "FaceFace" (your app name) in the Google login screen instead of "Auth0"

## 🎯 Start Here:

### 1.1 - Create Google Cloud Project (3 min)

**Go to:** https://console.cloud.google.com

1. Click the **project dropdown** at the top (next to "Google Cloud")
2. Click **"NEW PROJECT"** (top right)
3. Fill in:
   - **Project name**: `FaceFace App`
   - **Organization**: Leave as default
   - **Location**: Leave as default
4. Click **"CREATE"**
5. Wait 10-20 seconds for project creation
6. Select your new project from the dropdown

✅ **Checkpoint:** You should see "FaceFace App" in the top bar

---

### 1.2 - Configure OAuth Consent Screen (5 min)

This is what users see when they login with Google.

**In Google Cloud Console:**

1. In the left sidebar, click **"APIs & Services"** → **"OAuth consent screen"**

2. Choose **External** (allows any Google account)
   - Click **"CREATE"**

3. **Fill in OAuth consent screen:**

   **App information:**
   - **App name**: `FaceFace`
   - **User support email**: Your email (select from dropdown)
   - **App logo**: (Optional - skip for now)

   **App domain:** (Optional but recommended)
   - **Application home page**: `https://face2face-wq5b.onrender.com`
   - **Application privacy policy**: `https://face2face-wq5b.onrender.com/privacy.html`
   - **Application terms of service**: Leave empty for now

   **Authorized domains:**
   - Click **"ADD DOMAIN"**
   - Add: `onrender.com`

   **Developer contact information:**
   - **Email addresses**: Your email

4. Click **"SAVE AND CONTINUE"**

5. **Scopes** page:
   - Click **"ADD OR REMOVE SCOPES"**
   - Find and check:
     - ✅ `.../auth/userinfo.email`
     - ✅ `.../auth/userinfo.profile`
     - ✅ `openid`
   - Click **"UPDATE"**
   - Click **"SAVE AND CONTINUE"**

6. **Test users** page:
   - Click **"ADD USERS"**
   - Add your email (for testing)
   - Click **"ADD"**
   - Click **"SAVE AND CONTINUE"**

7. **Summary** page:
   - Review everything
   - Click **"BACK TO DASHBOARD"**

✅ **Checkpoint:** OAuth consent screen is configured

---

### 1.3 - Create OAuth 2.0 Credentials (3 min)

**In Google Cloud Console:**

1. Left sidebar → **"APIs & Services"** → **"Credentials"**

2. Click **"+ CREATE CREDENTIALS"** (top)

3. Select **"OAuth client ID"**

4. Fill in:
   - **Application type**: `Web application`
   - **Name**: `FaceFace Production`

5. **Authorized JavaScript origins:**
   - Click **"+ ADD URI"**
   - Enter: `https://face2face2.eu.auth0.com`

6. **Authorized redirect URIs:**
   - Click **"+ ADD URI"**
   - Enter: `https://face2face2.eu.auth0.com/login/callback`

7. Click **"CREATE"**

8. **IMPORTANT:** A popup shows your credentials
   - **Client ID**: (looks like `123456789-abc.apps.googleusercontent.com`)
   - **Client secret**: (looks like `GOCSPX-xyz123...`)
   
   **Copy both and save them temporarily** (text file, notepad)
   
   ⚠️ You can always retrieve them later from the Credentials page

9. Click **"OK"**

✅ **Checkpoint:** You have Client ID and Client Secret saved

---

### 1.4 - Update Auth0 with Your Credentials (4 min)

**Go to:** https://manage.auth0.com

1. Login to Auth0

2. Left sidebar → **"Authentication"** → **"Social"**

3. Click on **"Google"**

4. **Toggle OFF** the switch that says:
   **"Use Auth0's Developer Keys"**
   
   (The form will expand showing empty fields)

5. Fill in:
   - **Client ID**: Paste your Google Client ID
   - **Client Secret**: Paste your Google Client Secret

6. **Attributes** section (should already be checked):
   - ✅ Email
   - ✅ Profile
   
7. **Permissions** (Extended Permissions):
   - Should show: `email`, `profile`
   
8. Scroll down and click **"Save Changes"**

9. Go to **"Applications"** tab (at the top)
   - Make sure your application toggle is **ON** (green)

✅ **Checkpoint:** Auth0 is using your Google credentials

---

### 1.5 - Test Google OAuth (2 min)

1. Open your app: https://face2face-wq5b.onrender.com/login.html

2. Click **"Mit Google anmelden"**

3. **You should see:**
   - Google login screen
   - **App name: "FaceFace"** (instead of "Auth0")
   - May say "Google hasn't verified this app" - this is normal for new apps

4. Login with your Google account

5. **Should redirect back** to your app and log you in

✅ **STEP 1 COMPLETE!** Google OAuth with your own credentials ✅

---

# STEP 2: SendGrid Email Service (15 min)

## ✅ What You'll Achieve:
Email verification and password reset will actually send real emails!

## 🎯 Start Here:

### 2.1 - Create SendGrid Account (5 min)

1. Go to: https://signup.sendgrid.com/

2. Fill in:
   - **Email**: Your email
   - **Password**: Create a password
   - **Company name**: `FaceFace` (or your name)
   - **Website**: `https://face2face-wq5b.onrender.com`

3. Check the boxes:
   - ✅ I'm not a robot
   - ✅ Agree to terms

4. Click **"Create Account"**

5. Check your email for verification link
   - Click the verification link
   - Complete email verification

6. SendGrid will ask some questions:
   - **What's your role?**: Developer
   - **What brings you to SendGrid?**: Transactional emails
   - **Do you have a list?**: No
   - Click **"Get Started"**

✅ **Checkpoint:** SendGrid account created and verified

---

### 2.2 - Create API Key (3 min)

1. In SendGrid dashboard, left sidebar → **"Settings"** → **"API Keys"**

2. Click **"Create API Key"** (top right)

3. Fill in:
   - **API Key Name**: `FaceFace Production`
   - **API Key Permissions**: 
     - Select **"Restricted Access"**
     - Expand **"Mail Send"**
     - Toggle **"Mail Send"** to **ON** (blue)
   
4. Click **"Create & View"**

5. **IMPORTANT:** Copy the API key that appears
   - It starts with `SG.`
   - Looks like: `SG.xyz123abc456...`
   - **Save it somewhere safe** - you can't see it again!
   - You'll add this to Render in a moment

6. Click **"Done"**

✅ **Checkpoint:** You have your SendGrid API key saved

---

### 2.3 - Verify Sender Identity (5 min)

SendGrid requires you to verify an email address to send from.

**Option A: Single Sender Verification (Quick - FREE)**

1. Left sidebar → **"Settings"** → **"Sender Authentication"**

2. Click **"Get Started"** under "Single Sender Verification"

3. Click **"Create New Sender"**

4. Fill in the form:
   - **From Name**: `FaceFace`
   - **From Email Address**: Your email (the one you can access)
   - **Reply To**: Same email
   - **Company Address**: Your address (required by law)
   - **City**: Your city
   - **Country**: Your country
   - **Nickname**: `FaceFace Notifications`

5. Click **"Create"**

6. Check your email for verification
   - Click the verification link
   - You'll see "Sender verified!"

✅ **Checkpoint:** Sender email verified

---

### 2.4 - Add SendGrid to Render (2 min)

1. Go to: https://dashboard.render.com

2. Open your **faceface-app** service

3. Click **"Environment"** in the left sidebar

4. Click **"Add Environment Variable"**

5. Add these **3 new variables:**

   **Variable 1:**
   - Key: `EMAIL_SERVICE`
   - Value: `sendgrid`

   **Variable 2:**
   - Key: `SENDGRID_API_KEY`
   - Value: Paste your SendGrid API key (starts with `SG.`)

   **Variable 3:**
   - Key: `EMAIL_FROM`
   - Value: `FaceFace <your-verified-email@gmail.com>`
   
   Replace `your-verified-email@gmail.com` with the email you verified in step 2.3

6. Click **"Save Changes"**

7. Render will automatically redeploy (wait 2-3 minutes)

✅ **STEP 2 COMPLETE!** Email service configured ✅

---

# STEP 3: Privacy Policy Page (30 min)

## ✅ What You'll Achieve:
Legal compliance (GDPR, etc.) and professional appearance

## 🎯 I'll create this for you:

I'll generate a privacy policy page tailored to your app with:
- What data you collect
- How you use it
- User rights (GDPR compliant)
- Cookie policy
- Contact information

### Your input needed:
1. **Your legal name or company name**: (e.g., "Max Mustermann" or "FaceFace GmbH")
2. **Your email for privacy inquiries**: (e.g., privacy@yourdomain.com or your email)
3. **Your location** (country): (e.g., "Germany")

**Type these 3 things and I'll generate the complete privacy policy page.**

---

# STEP 4: Test Everything (10 min)

Once Steps 1-3 are done, we'll test:
- [ ] Google login shows your app name
- [ ] Registration sends verification email
- [ ] Email verification link works
- [ ] Password reset sends email
- [ ] Privacy policy page is accessible

---

# STEP 5: Deploy & Launch! (5 min)

Final checks and go live!

---

## 📊 Current Progress:
✅ Step 1: Google OAuth - Ready to start
⏸️ Step 2: SendGrid - Waiting for Step 1
⏸️ Step 3: Privacy Policy - Waiting for your info
⏸️ Step 4: Testing - Waiting for Steps 1-3
⏸️ Step 5: Launch - Waiting for Step 4

---

**Let's start with Step 1! Follow the instructions above for Google OAuth Credentials.**

**Tell me when you're done with Step 1, and I'll guide you through Step 2!**

