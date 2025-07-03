import React from 'react';

export default function DashboardMinimal() {
  return (
    <div>
      <div 
        id="root-container"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 50%, #e8f5e8 100%)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
        dangerouslySetInnerHTML={{
          __html: `
            <div id="header" style="background: white; border-bottom: 1px solid #e5e7eb; padding: 16px 0;">
              <div style="max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 16px;">
                  <h1 style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 0;">🚗 HitchBuddy</h1>
                  <span id="userType" style="background: #f3f4f6; color: #374151; padding: 4px 12px; border-radius: 16px; font-size: 14px;">Loading...</span>
                </div>
                <div style="display: flex; align-items: center; gap: 16px;">
                  <span id="userName" style="color: #6b7280; font-size: 14px;">Loading user...</span>
                  <button onclick="signOut()" style="background: transparent; border: 1px solid #d1d5db; color: #374151; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;">Sign Out</button>
                </div>
              </div>
            </div>

            <div id="main" style="max-width: 1200px; margin: 0 auto; padding: 32px 24px;">
              <div id="tabs" style="margin-bottom: 24px; text-align: center;">
                <button onclick="showTab('overview')" class="tab-btn active" style="padding: 12px 24px; margin: 0 4px; background: #3b82f6; color: white; border: 2px solid #3b82f6; border-radius: 8px; cursor: pointer; font-weight: 500;">Overview</button>
                <button onclick="showTab('rides')" class="tab-btn" style="padding: 12px 24px; margin: 0 4px; background: white; color: #374151; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; font-weight: 500;">My Rides</button>
                <button onclick="showTab('bookings')" class="tab-btn" style="padding: 12px 24px; margin: 0 4px; background: white; color: #374151; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; font-weight: 500;">Bookings</button>
                <button onclick="showTab('settings')" class="tab-btn" style="padding: 12px 24px; margin: 0 4px; background: white; color: #374151; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; font-weight: 500;">Settings</button>
              </div>

              <div id="tab-overview" class="tab-content">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                  <div style="background: white; border-radius: 8px; padding: 20px; text-align: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <div style="font-size: 32px; font-weight: bold; color: #1f2937; margin-bottom: 8px;">0</div>
                    <div style="color: #6b7280; font-size: 14px;">Total Rides</div>
                  </div>
                  <div style="background: white; border-radius: 8px; padding: 20px; text-align: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <div style="font-size: 32px; font-weight: bold; color: #1f2937; margin-bottom: 8px;">0</div>
                    <div style="color: #6b7280; font-size: 14px;">Active Bookings</div>
                  </div>
                  <div style="background: white; border-radius: 8px; padding: 20px; text-align: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <div style="font-size: 32px; font-weight: bold; color: #1f2937; margin-bottom: 8px;">0</div>
                    <div style="color: #6b7280; font-size: 14px;">Messages</div>
                  </div>
                </div>

                <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  <h3 style="margin-top: 0; margin-bottom: 16px; color: #1f2937;">Welcome to HitchBuddy!</h3>
                  <p style="color: #6b7280; margin-bottom: 24px;">Your sustainable ride-sharing platform is ready to use. Start by exploring the features:</p>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
                    <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
                      <h4 style="margin: 0 0 8px 0; color: #1f2937;">🚗 For Drivers</h4>
                      <p style="font-size: 14px; color: #6b7280; margin: 0;">Post available rides and connect with riders going your way</p>
                    </div>
                    <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
                      <h4 style="margin: 0 0 8px 0; color: #1f2937;">🎒 For Riders</h4>
                      <p style="font-size: 14px; color: #6b7280; margin: 0;">Find available rides and book your journey with trusted drivers</p>
                    </div>
                  </div>
                </div>
              </div>

              <div id="tab-rides" class="tab-content" style="display: none;">
                <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  <h3 style="margin-top: 0; margin-bottom: 16px; color: #1f2937;">My Rides</h3>
                  <div style="text-align: center; padding: 32px 0;">
                    <p style="color: #6b7280; margin-bottom: 16px;">No rides posted yet</p>
                    <button style="background-color: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">Post New Ride</button>
                  </div>
                </div>
              </div>

              <div id="tab-bookings" class="tab-content" style="display: none;">
                <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  <h3 style="margin-top: 0; margin-bottom: 16px; color: #1f2937;">My Bookings</h3>
                  <div style="text-align: center; padding: 32px 0;">
                    <p style="color: #6b7280; margin-bottom: 16px;">No bookings yet</p>
                    <button style="background-color: #16a34a; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">Find Rides</button>
                  </div>
                </div>
              </div>

              <div id="tab-settings" class="tab-content" style="display: none;">
                <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  <h3 style="margin-top: 0; margin-bottom: 16px; color: #1f2937;">Profile Settings</h3>
                  <div id="profile-info" style="display: grid; gap: 16px;">
                    <div>
                      <label style="font-size: 14px; font-weight: 500; color: #374151;">Email</label>
                      <p id="user-email" style="font-size: 14px; color: #6b7280; margin: 4px 0 0 0;">Loading...</p>
                    </div>
                    <div>
                      <label style="font-size: 14px; font-weight: 500; color: #374151;">Name</label>
                      <p id="user-name" style="font-size: 14px; color: #6b7280; margin: 4px 0 0 0;">Loading...</p>
                    </div>
                    <div>
                      <label style="font-size: 14px; font-weight: 500; color: #374151;">Account Type</label>
                      <p id="user-type" style="font-size: 14px; color: #6b7280; margin: 4px 0 0 0;">Loading...</p>
                    </div>
                    <button style="background: transparent; border: 1px solid #d1d5db; color: #374151; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; width: fit-content;">Edit Profile</button>
                  </div>
                </div>

                <div id="admin-panel" style="display: none; background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); color: white; border-radius: 12px; padding: 24px; margin-top: 16px;">
                  <h3 style="margin-top: 0; margin-bottom: 16px;">🔧 Admin Portal</h3>
                  <p style="margin-bottom: 16px; opacity: 0.9;">Administrative functions for system management</p>
                  <div id="admin-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 24px;">
                    <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; text-align: center;">
                      <div id="total-users" style="font-size: 20px; font-weight: bold;">0</div>
                      <div style="font-size: 12px; opacity: 0.8;">Total Users</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; text-align: center;">
                      <div id="total-rides" style="font-size: 20px; font-weight: bold;">0</div>
                      <div style="font-size: 12px; opacity: 0.8;">Total Rides</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; text-align: center;">
                      <div id="total-bookings" style="font-size: 20px; font-weight: bold;">0</div>
                      <div style="font-size: 12px; opacity: 0.8;">Total Bookings</div>
                    </div>
                  </div>
                  <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 16px;">
                    <h4 style="margin: 0 0 12px 0;">User Management</h4>
                    <div id="users-list" style="max-height: 200px; overflow-y: auto;">Loading users...</div>
                  </div>
                </div>
              </div>
            </div>

            <script>
              let currentUser = null;

              // Auth check and user loading
              async function checkAuth() {
                try {
                  const response = await fetch('/api/auth/me', {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                  });
                  
                  if (response.ok) {
                    currentUser = await response.json();
                    updateUserDisplay();
                    if (currentUser.email === 'coolsami_uk@yahoo.com') {
                      loadAdminData();
                    }
                  } else {
                    window.location.href = '/auth';
                  }
                } catch (error) {
                  console.error('Auth check failed:', error);
                  window.location.href = '/auth';
                }
              }

              function updateUserDisplay() {
                if (!currentUser) return;
                
                document.getElementById('userName').textContent = 'Welcome, ' + (currentUser.firstName || 'User') + ' ' + (currentUser.lastName || '');
                document.getElementById('userType').textContent = currentUser.userType === 'driver' ? 'Driver' : 'Rider';
                document.getElementById('user-email').textContent = currentUser.email;
                document.getElementById('user-name').textContent = (currentUser.firstName || '') + ' ' + (currentUser.lastName || '');
                document.getElementById('user-type').textContent = currentUser.userType;
                
                if (currentUser.email === 'coolsami_uk@yahoo.com') {
                  document.getElementById('admin-panel').style.display = 'block';
                }
              }

              async function loadAdminData() {
                try {
                  const statsResponse = await fetch('/api/admin/stats', { credentials: 'include' });
                  if (statsResponse.ok) {
                    const stats = await statsResponse.json();
                    document.getElementById('total-users').textContent = stats.totalUsers || 0;
                    document.getElementById('total-rides').textContent = stats.totalRides || 0;
                    document.getElementById('total-bookings').textContent = stats.totalBookings || 0;
                  }

                  const usersResponse = await fetch('/api/admin/users', { credentials: 'include' });
                  if (usersResponse.ok) {
                    const users = await usersResponse.json();
                    const usersList = document.getElementById('users-list');
                    if (users && users.length > 0) {
                      usersList.innerHTML = users.slice(0, 5).map(user => 
                        '<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);"><div><div style="font-weight: 500;">' + 
                        (user.firstName || '') + ' ' + (user.lastName || '') + '</div><div style="font-size: 12px; opacity: 0.8;">' + 
                        user.email + ' (' + user.userType + ')</div></div><div style="font-size: 12px; opacity: 0.8;">' + 
                        new Date(user.createdAt).toLocaleDateString() + '</div></div>'
                      ).join('');
                    } else {
                      usersList.innerHTML = '<p style="opacity: 0.8; font-size: 14px;">No users found</p>';
                    }
                  }
                } catch (error) {
                  console.error('Error loading admin data:', error);
                }
              }

              function showTab(tabName) {
                // Hide all tabs
                const tabs = document.querySelectorAll('.tab-content');
                tabs.forEach(tab => tab.style.display = 'none');
                
                // Remove active class from all buttons
                const buttons = document.querySelectorAll('.tab-btn');
                buttons.forEach(btn => {
                  btn.style.background = 'white';
                  btn.style.color = '#374151';
                  btn.style.borderColor = '#e5e7eb';
                });
                
                // Show selected tab
                document.getElementById('tab-' + tabName).style.display = 'block';
                
                // Set active button
                event.target.style.background = '#3b82f6';
                event.target.style.color = 'white';
                event.target.style.borderColor = '#3b82f6';
              }

              async function signOut() {
                try {
                  await fetch('/api/auth/signout', {
                    method: 'POST',
                    credentials: 'include'
                  });
                  window.location.href = '/';
                } catch (error) {
                  console.error('Sign out failed:', error);
                  window.location.href = '/';
                }
              }

              // Initialize on load
              checkAuth();
            </script>
          `
        }}
      />
    </div>
  );
}