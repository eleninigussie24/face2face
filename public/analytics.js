// Google Analytics 4 - Face2Face
// Measurement ID wird beim Einbau eingefügt

// Analytics Helper Functions
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

// WICHTIG: Ersetze 'G-XXXXXXXXXX' mit Ihrer echten Measurement ID
gtag('config', 'G-XXXXXXXXXX', {
  'send_page_view': true
});

// Custom Events für Face2Face
var analytics = {
  // Registrierung tracken
  trackSignup: function() {
    gtag('event', 'sign_up', {
      'method': 'email'
    });
    console.log('Analytics: Sign up tracked');
  },
  
  // Login tracken
  trackLogin: function(method) {
    gtag('event', 'login', {
      'method': method || 'email'
    });
    console.log('Analytics: Login tracked');
  },
  
  // Gruppe erstellen tracken
  trackGroupCreate: function(groupName) {
    gtag('event', 'group_create', {
      'group_name': groupName
    });
    console.log('Analytics: Group create tracked');
  },
  
  // Gruppe beitreten tracken
  trackGroupJoin: function(groupId) {
    gtag('event', 'group_join', {
      'group_id': groupId
    });
    console.log('Analytics: Group join tracked');
  },
  
  // Profil Update tracken
  trackProfileUpdate: function() {
    gtag('event', 'profile_update');
    console.log('Analytics: Profile update tracked');
  },
  
  // QR Code Scan tracken (via UTM Parameter)
  trackQRScan: function(location) {
    gtag('event', 'qr_scan', {
      'location': location
    });
    console.log('Analytics: QR scan tracked from', location);
  }
};

// QR-Code-Tracking via UTM-Parameter
// Automatisch UTM-Parameter erkennen
(function() {
  var urlParams = new URLSearchParams(window.location.search);
  var utmSource = urlParams.get('utm_source');
  var utmCampaign = urlParams.get('utm_campaign');
  
  if (utmSource === 'qr-code' || utmSource === 'poster') {
    analytics.trackQRScan(utmCampaign || 'unknown');
  }
})();





