// N-UIP LINE OA Simulator Engine — with LIFF Login Integration

// ============================================================
// LIFF ID CONFIG — ใส่ LIFF ID ของคุณตรงนี้
// สร้างได้ที่: https://developers.line.biz → Channel → LIFF
// ============================================================
const LIFF_ID = 'YOUR_LIFF_ID_HERE';   // <-- แก้ไขตรงนี้

// ============================================================
// BOOTSTRAP
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  initClock();
  setupEventListeners();
  setupLoginButtons();
  await initLiff();
});


// 1. INITIALIZE SYSTEM CLOCK
function initClock() {
  const clockElement = document.getElementById('live-time');
  const updateTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clockElement.textContent = `${hours}:${minutes}`;
  };
  updateTime();
  setInterval(updateTime, 60000);
}

// ============================================================
// 2. LIFF: INITIALIZATION & AUTH FLOW
// ============================================================

async function initLiff() {
  const loadingScreen = document.getElementById('liff-loading-screen');
  const loginScreen   = document.getElementById('liff-login-screen');
  const devNote       = document.getElementById('dev-mode-note');

  // ถ้ายังไม่ได้ตั้ง LIFF ID → แสดงหน้า Login พร้อม dev note
  if (LIFF_ID === 'YOUR_LIFF_ID_HERE') {
    loadingScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    devNote.classList.add('visible');
    console.warn('[N-UIP] LIFF ID ยังไม่ได้ตั้งค่า — ใส่ใน app.js บรรทัด LIFF_ID');
    return;
  }

  try {
    // Initialize LIFF SDK
    await liff.init({ liffId: LIFF_ID });

    if (!liff.isLoggedIn()) {
      // ยังไม่ได้ Login → ซ่อน loading, แสดงหน้า Login
      loadingScreen.classList.add('hidden');
      loginScreen.classList.remove('hidden');
    } else {
      // Login แล้ว → ดึงข้อมูล Profile และเข้าหน้าหลัก
      loadingScreen.classList.add('hidden');
      loginScreen.classList.add('hidden');
      const profile = await liff.getProfile();
      injectLineProfile(profile);
      showLoggedInState(profile);
    }

  } catch (err) {
    console.error('[N-UIP] LIFF init error:', err);
    // Fallback → ซ่อน loading แสดงหน้า login พร้อมข้อความ error
    loadingScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    devNote.classList.add('visible');
    devNote.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color:#EF4444"></i> LIFF Error: ${err.message}`;
  }
}

// ============================================================
// 3. LIFF: BUTTON HANDLERS
// ============================================================

function setupLoginButtons() {
  const loginBtn = document.getElementById('line-login-btn');
  const skipBtn  = document.getElementById('skip-login-btn');

  // ปุ่ม Login ด้วย LINE
  loginBtn.addEventListener('click', () => {
    if (LIFF_ID === 'YOUR_LIFF_ID_HERE') {
      alert('กรุณาตั้งค่า LIFF ID ก่อนนะครับ\n\n1. เข้า developers.line.biz\n2. สร้าง LIFF App\n3. คัดลอก LIFF ID\n4. วางใน app.js บรรทัด const LIFF_ID = \'...\'');
      return;
    }
    // Redirect ไป LINE OAuth
    liff.login({ redirectUri: window.location.href });
  });

  // ปุ่ม Skip (Preview Mode โดยไม่ Login)
  skipBtn.addEventListener('click', () => {
    const loginScreen = document.getElementById('liff-login-screen');
    loginScreen.classList.add('hidden');
    // ใช้ข้อมูล Mock แทน
    injectLineProfile({
      displayName: 'สมชาย รักษ์นนทบุรี',
      pictureUrl: null,
      userId: 'PREVIEW_USER_MOCK',
    });
    showLoggedInState({
      displayName: 'สมชาย รักษ์นนทบุรี',
      pictureUrl: null,
      userId: 'PREVIEW_USER_MOCK',
    });
  });
}

// ============================================================
// 4. LIFF: INJECT PROFILE INTO SUAN SUK DASHBOARD
// ============================================================

function injectLineProfile(profile) {
  // อัปเดต Profile badge ใน Header ของ Suan Suk
  const headerEl = document.querySelector('.suansuk-header');
  if (!headerEl) return;

  // สร้าง badge element
  const badgeId = 'line-user-badge';
  let badge = document.getElementById(badgeId);
  if (!badge) {
    badge = document.createElement('div');
    badge.id = badgeId;
    badge.className = 'line-profile-badge';
    headerEl.appendChild(badge);
  }

  const picHtml = profile.pictureUrl
    ? `<img class="line-profile-pic" src="${profile.pictureUrl}" alt="${profile.displayName}">`
    : `<div class="line-profile-pic-placeholder">${profile.displayName.charAt(0)}</div>`;

  badge.innerHTML = `
    ${picHtml}
    <span class="line-profile-name">${profile.displayName}</span>
    <span class="line-logged-badge">LINE</span>
  `;

  // อัปเดต Title info ด้วย
  const titleEl = document.querySelector('.suansuk-title-info h4');
  if (titleEl) titleEl.textContent = 'หมู่บ้านสวนสุข';

  // เพิ่ม subtitle บอก userId
  console.info(`[N-UIP] Logged in as: ${profile.displayName} (${profile.userId})`);
}

function showLoggedInState(profile) {
  // แสดงข้อความต้อนรับใน Chat
  setTimeout(() => {
    appendMessage('bot', 
      `🎉 ยินดีต้อนรับกลับมา **${profile.displayName}** ค่ะ!\n\nคุณได้ Login ผ่าน LINE สำเร็จแล้ว ระบบได้ดึงข้อมูลบัญชี N-UIP ของท่านเรียบร้อยครับ\n\nกดเลือกเมนูด้านล่าง หรือพิมพ์คำถามเกี่ยวกับขยะในชุมชนได้เลยนะครับ 💚`
    );
  }, 500);
}

// ============================================================
// 5. LIFF: LOGOUT
// ============================================================

function liffLogout() {
  if (typeof liff !== 'undefined' && liff.isLoggedIn()) {
    liff.logout();
    window.location.reload();
  } else {
    // Preview mode — reload กลับหน้า login
    window.location.reload();
  }
}


let richMenuOpen = true;
let isBotTyping = false;
let hasUploadedPhoto = false;

// 3. SELECTION & EVENT LISTENERS
function setupEventListeners() {
  const sendBtn = document.getElementById('send-btn');
  const chatInput = document.getElementById('chat-input');
  const richMenuToggle = document.getElementById('rich-menu-toggle');
  const richMenu = document.getElementById('rich-menu');
  
  // Send message on click
  sendBtn.addEventListener('click', () => {
    handleUserSend();
  });

  // Send message on Enter press
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleUserSend();
    }
  });

  // Toggle Rich Menu
  richMenuToggle.addEventListener('click', () => {
    richMenuOpen = !richMenuOpen;
    if (richMenuOpen) {
      richMenu.classList.add('active');
    } else {
      richMenu.classList.remove('active');
    }
    scrollToBottom();
  });

  // Rich Menu Grid Button Triggers
  document.getElementById('rich-ai-btn').addEventListener('click', () => {
    sendSimulatedUserMessage('🤖 คุยกับ AI Bot');
    triggerBotResponse('ai_chat');
  });

  document.getElementById('rich-schedule-btn').addEventListener('click', () => {
    sendSimulatedUserMessage('📅 ขอตารางเวลาเก็บขยะ');
    triggerBotResponse('schedule');
  });

  document.getElementById('rich-agent-btn').addEventListener('click', () => {
    sendSimulatedUserMessage('📞 ติดต่อเจ้าหน้าที่');
    triggerBotResponse('agent');
  });

  document.getElementById('rich-alert-btn').addEventListener('click', () => {
    sendSimulatedUserMessage('🔔 ตั้งค่าแจ้งเตือนภัย');
    triggerBotResponse('alert');
  });
}

// 4. CHAT UTILITIES
function scrollToBottom() {
  const chatMessages = document.getElementById('chat-messages');
  setTimeout(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 50);
}

function sendSimulatedUserMessage(text) {
  appendMessage('user', text);
}

function handleUserSend() {
  const chatInput = document.getElementById('chat-input');
  const text = chatInput.value.trim();
  if (!text) return;

  appendMessage('user', text);
  chatInput.value = '';
  
  // Trigger appropriate bot response based on keywords
  const query = text.toLowerCase();
  if (query.includes('ตาราง') || query.includes('รถขยะ') || query.includes('เก็บเวลา')) {
    triggerBotResponse('schedule');
  } else if (query.includes('คะแนน') || query.includes('แต้ม') || query.includes('เหรียญ')) {
    triggerBotResponse('points');
  } else if (query.includes('พลาสติก') || query.includes('ขวด') || query.includes('กล่อง') || query.includes('แยกขยะ')) {
    triggerBotResponse('sorting');
  } else if (query.includes('ติดต่อ') || query.includes('เจ้าหน้าที่') || query.includes('คุยกับคน')) {
    triggerBotResponse('agent');
  } else if (query.includes('รายงาน') || query.includes('แจ้งขยะ') || query.includes('สกปรก')) {
    triggerBotResponse('report_info');
  } else {
    triggerBotResponse('general', text);
  }
}

// APPEND MESSAGE BUBBLE TO CHAT
function appendMessage(sender, content, type = 'text', cardData = null) {
  const chatMessages = document.getElementById('chat-messages');
  const msgRow = document.createElement('div');
  msgRow.className = `msg-row ${sender === 'bot' ? 'bot-msg' : 'user-msg'}`;

  // Avatar for Bot
  let avatarHTML = '';
  if (sender === 'bot') {
    avatarHTML = `<div class="msg-avatar"><i class="fa-solid fa-leaf"></i></div>`;
  }

  let bubbleHTML = '';
  if (type === 'text') {
    bubbleHTML = `
      <div class="msg-bubble-group">
        <div class="msg-bubble text-bubble">${content.replace(/\n/g, '<br>')}</div>
      </div>
    `;
  } else if (type === 'card') {
    bubbleHTML = `
      <div class="msg-bubble-group">
        <div class="msg-bubble card-bubble">
          <div class="card-image-placeholder" style="background: ${cardData.color || 'linear-gradient(135deg, #3B82F6, #1D4ED8)'}">
            <i class="${cardData.bgIcon || 'fa-solid fa-recycle'} card-bg-icon"></i>
            <div class="card-overlay-text">${cardData.overlayText || ''}</div>
          </div>
          <div class="card-content">
            <h4>${cardData.title}</h4>
            <p>${cardData.description}</p>
            <div class="card-actions">
              ${cardData.actions.map(act => `
                <button class="card-action-btn" onclick="${act.action}">
                  ${act.label}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  msgRow.innerHTML = avatarHTML + bubbleHTML;
  chatMessages.appendChild(msgRow);
  scrollToBottom();
}

// SHOW BOT TYING / DELAY
function triggerBotResponse(intent, userMsgText = '') {
  if (isBotTyping) return;
  isBotTyping = true;

  // Append a temporary typing indicator bubble
  const chatMessages = document.getElementById('chat-messages');
  const typingRow = document.createElement('div');
  typingRow.className = 'msg-row bot-msg typing-indicator-row';
  typingRow.innerHTML = `
    <div class="msg-avatar"><i class="fa-solid fa-leaf"></i></div>
    <div class="msg-bubble-group">
      <div class="msg-bubble text-bubble" style="padding: 10px 18px; color: #94A3B8;">
        <i class="fa-solid fa-ellipsis fa-bounce"></i> กำลังพิมพ์...
      </div>
    </div>
  `;
  chatMessages.appendChild(typingRow);
  scrollToBottom();

  // Simulate server response delay
  setTimeout(() => {
    // Remove typing indicator
    typingRow.remove();
    isBotTyping = false;

    // Dispatch bot message based on intent
    switch (intent) {
      case 'ai_chat':
        appendMessage('bot', `สวัสดีค่ะ! ฉันคือผู้ช่วยคัดแยกขยะ AI ประจำจังหวัดนนทบุรี 🤖🍃\n\nท่านสามารถพิมพ์สอบถามวิธีการคัดแยกขยะ หรือจุดบริการทิ้งขยะอันตรายได้เลยค่ะ เช่น\n• "ขวดพลาสติกใสทิ้งยังไง"\n• "กล่องนมต้องล้างไหม"\n• "แต้มรีไซเคิลแลกอะไรได้บ้าง"`);
        break;

      case 'schedule':
        appendMessage('bot', null, 'card', {
          title: 'รถเก็บขยะในพื้นที่ของท่าน 🚛',
          description: 'พิกัดอำเภอปากเกร็ด: รถวิ่งจันทร์, พุธ, ศุกร์ เวลา 08:30 - 11:30 น. สามารถติดตามพิกัด GPS แบบสดของรถผ่านระบบ N-UIP ได้ค่ะ',
          overlayText: 'Garbage Fleet Live',
          color: 'linear-gradient(135deg, #F59E0B, #D97706)',
          bgIcon: 'fa-solid fa-truck-monster',
          actions: [
            { label: '📍 ติดตามรถขยะสดบนแผนที่', action: 'alert("จำลอง: กำลังดึงข้อมูลพิกัด GPS รถขยะทะเบียน 8x-xxxx นนทบุรี")' },
            { label: '🔔 ตั้งเตือนก่อนรถขยะมาถึง', action: 'simulateAlertSetup()' }
          ]
        });
        break;

      case 'agent':
        appendMessage('bot', `ขณะนี้ระบบกำลังโอนสายไปยังเจ้าหน้าที่เทศบาลเมืองนนทบุรี เพื่อรับเรื่องร้องเรียนทั่วไป กรุณารอสักครู่ค่ะ... 📞👤\n\n(ในการใช้งานจริง จะส่งต่อไปยังระบบ Live Chat Agent ของจังหวัด)`);
        break;

      case 'alert':
        appendMessage('bot', `บันทึกการตั้งค่าแล้ว! 🔔 ท่านจะได้รับข้อความแจ้งเตือนข่าวน้ำท่วม, ค่าฝุ่น PM2.5 วิกฤต, และวันเก็บขยะล่วงหน้า 1 วันของตำบลปากเกร็ดค่ะ หากต้องการยกเลิก สามารถพิมพ์ "ยกเลิกแจ้งเตือน" ได้ตลอดเวลาค่ะ`);
        break;

      case 'points':
        appendMessage('bot', null, 'card', {
          title: 'ยอดคะแนนคาร์บอนเครดิตสะสม 💚',
          description: 'คุณมีคะแนนสะสม 1,240 คะแนน (ลดการปล่อยคาร์บอน 84.2 kg CO2e) แลกรับถุงขยะแยกสีหรือส่วนลดตั๋วรถเมล์นนท์พรีเมียมได้ฟรี!',
          overlayText: 'Carbon Credits',
          color: 'linear-gradient(135deg, #10B981, #047857)',
          bgIcon: 'fa-solid fa-award',
          actions: [
            { label: '📱 เปิดหน้าสะสมคะแนน (LIFF)', action: 'openLiff("points")' },
            { label: '🎁 แลกรับของรางวัล', action: 'simulateRedeem()' }
          ]
        });
        break;

      case 'sorting':
        appendMessage('bot', `💡 **คำแนะนำการคัดแยกขยะ:**\n\n• **ขวดพลาสติก PET ใส**: กรุณาเทน้ำทิ้ง บีบแบนเพื่อประหยัดพื้นที่ และทิ้งลงถังขยะรีไซเคิลสีเหลือง ได้รับ **20 คะแนน/กิโลกรัม**\n• **ขวดทึบ/ขวดแชมพู (HDPE)**: ล้างสะอาด ทิ้งลงถังเหลือง ได้รับ **15 คะแนน/กิโลกรัม**\n\nการทิ้งแบบถูกวิธีช่วยให้ชุมชนประหยัดค่าบำบัดขยะลงถึง 40% ค่ะ! ♻️`);
        break;

      case 'report_info':
        appendMessage('bot', `หากพบถังขยะล้น จุดทิ้งขยะผิดกฎหมาย หรือจุดสกปรกที่ต้องการความสะอาดในเขตจังหวัดนนทบุรี ท่านสามารถกดปุ่ม "รายงานขยะล้น" ที่แผง Rich Menu ด้านล่าง เพื่อส่งพิกัดและรูปถ่ายให้เทศบาลดำเนินการได้ทันทีค่ะ 🚨`);
        break;

      case 'general':
      default:
        // Simple intelligent generic answers
        const replyText = userMsgText.trim();
        if (replyText.length > 0) {
          appendMessage('bot', `ฉันได้รับข้อความ: "${userMsgText}" แล้วค่ะ 📝\n\nท่านสามารถแจ้งข้อมูลขยะผ่าน Rich Menu หรือคลิกที่ลิงก์ด้านล่างเพื่อเริ่มคุยกับ AI บอทเฉพาะทางคัดแยกสิ่งแวดล้อมได้เลยค่ะ`);
        } else {
          appendMessage('bot', `ขออภัยค่ะ ฉันไม่พบคำสั่งที่ต้องการ ท่านสามารถคลิกเลือกปุ่มต่างๆ บน **Rich Menu** ด้านล่างหน้าจอ เพื่อดูตารางรถขยะ แจ้งขยะล้น หรือตรวจสอบคะแนนสะสมได้สะดวกยิ่งขึ้นนะคะ 😊`);
        }
        break;
    }
  }, 1000);
}

// 5. LIFF APP CONTROLLERS
function openLiff(appId) {
  const overlay = document.getElementById('liff-overlay');
  const reportApp = document.getElementById('liff-report-app');
  const pointsApp = document.getElementById('liff-points-app');
  const appTitle = document.getElementById('liff-app-title');

  // Slide up LIFF webview container
  overlay.classList.add('active');

  // Toggle visible app content inside LIFF
  if (appId === 'report') {
    reportApp.classList.remove('hidden');
    pointsApp.classList.add('hidden');
    appTitle.textContent = 'รายงานขยะล้น / จุดสกปรก';
    resetReportForm();
  } else if (appId === 'points') {
    pointsApp.classList.remove('hidden');
    reportApp.classList.add('hidden');
    appTitle.textContent = 'บัญชีสะสมคะแนน N-UIP';
  }
}

function closeLiff() {
  const overlay = document.getElementById('liff-overlay');
  overlay.classList.remove('active');
}

// LIFF Form Reset utility
function resetReportForm() {
  document.getElementById('report-waste-form').reset();
  const uploadContainer = document.getElementById('upload-preview-container');
  uploadContainer.innerHTML = `
    <i class="fa-solid fa-camera camera-icon"></i>
    <span>กดเพื่อถ่ายรูปภาพ หรือ แนบรูป</span>
    <p class="upload-tip">รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB</p>
  `;
  document.getElementById('attached-photo-val').value = '';
  hasUploadedPhoto = false;
}

// Simulate Photo Attachment
function simulatePhotoUpload() {
  if (hasUploadedPhoto) return; // already uploaded in this session

  const uploadContainer = document.getElementById('upload-preview-container');
  uploadContainer.innerHTML = `<i class="fa-solid fa-spinner fa-spin camera-icon"></i> <span>กำลังอ่านไฟล์ภาพ...</span>`;

  // Simulated delay to mimic image processing
  setTimeout(() => {
    uploadContainer.innerHTML = `
      <img src="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=400&q=80" alt="Mock Waste" class="uploaded-img">
    `;
    document.getElementById('attached-photo-val').value = 'mock_image_data_uri';
    hasUploadedPhoto = true;
  }, 1200);
}

// Handle Form Submission (Report Waste)
function handleReportSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('report-waste-form');
  const submitBtn = document.getElementById('report-submit-btn');
  const wasteType = form.elements['waste_type'].value;
  const detail = document.getElementById('report-detail').value || '-';

  if (!hasUploadedPhoto) {
    alert('กรุณาแนบรูปภาพก่อนส่งรายงานค่ะ เพื่อเป็นหลักฐานให้เจ้าหน้าที่');
    return;
  }

  // Disable button and show sending state
  submitBtn.disabled = true;
  submitBtn.textContent = 'กำลังส่งรายงานข้อมูล...';

  // Simulate API post request delay
  setTimeout(() => {
    // Show Success Toast
    const toast = document.getElementById('success-toast');
    document.getElementById('toast-message').textContent = 'รายงานขยะประเภท ' + wasteType + ' เรียบร้อยแล้ว';
    toast.classList.add('active');

    setTimeout(() => {
      // Clear states
      toast.classList.remove('active');
      submitBtn.disabled = false;
      submitBtn.textContent = 'ส่งรายงานเข้าสู่ระบบ N-UIP';
      closeLiff();

      // Send auto user and bot updates inside LINE chat logs
      sendSimulatedUserMessage(`🚨 รายงานความสะอาดเสร็จสิ้น\n• ประเภท: ${wasteType}\n• รายละเอียด: ${detail}\n• พิกัด: ปากเกร็ด นนทบุรี`);
      
      // Bot confirms submission success
      setTimeout(() => {
        appendMessage('bot', `เจ้าหน้าที่ได้รับแจ้งเรื่องแล้วค่ะ! 🚨\n\n• รหัสคำสั่ง: #NUIP-${Math.floor(100000 + Math.random() * 900000)}\n• ข้อมูลถูกบันทึกเข้าระบบพิกัด GIS ของเทศบาลปากเกร็ดแล้ว\n\nท่านจะได้รับข้อความแจ้งเตือนความคืบหน้าเมื่อเจ้าหน้าที่เข้าทำความสะอาดเสร็จสิ้นค่ะ ขอบคุณมากนะคะที่ช่วยร่วมสร้างสิ่งแวดล้อมที่ดีในนนทบุรี! 💚🙏`);
      }, 1000);

    }, 2000);

  }, 1500);
}

// 6. ACTION CARD MOCK TRIGGERS
function simulateAlertSetup() {
  alert('ระบบได้เชื่อมต่อการแจ้งเตือนรถขยะเข้าสู่บัญชี LINE OA ของท่านแล้ว! คุณจะได้รับการสั่นเตือนเมื่อรถขยะอยู่ห่างออกไป 10 นาที');
}

function simulateRedeem() {
  const points = 1240;
  if (points < 500) {
    alert('คะแนนของท่านไม่เพียงพอสำหรับแลกรางวัลขั้นต่ำ');
    return;
  }
  
  if (confirm('คุณต้องการใช้ 500 คะแนนเพื่อแลกตั๋วรถเมล์พรีเมียมนนทบุรีฟรี 1 ใบ ใช่หรือไม่?')) {
    alert('การแลกตั๋วสำเร็จ! 🎟️ หัก 500 คะแนน\nรหัสตั๋วของคุณคือ: NUIP-BUS-MOCK-99212 (แสดงรหัสแก่พนักงานขับรถ)');
  }
}

function simulateRedeemBanner() {
  alert('เปิดหน้าต่างแลกรางวัลของทางจังหวัดนนทบุรี (จำลองการดึงรายการคูปองและดีลส่วนลดร้านค้าชุมชน)');
}

// 7. SUAN SUK VILLAGE PORTAL HANDLERS

function openFundHistory() {
  closeLiff();
  setTimeout(() => {
    sendSimulatedUserMessage('📋 ดูประวัติเงินกองทุนชุมชน');
    setTimeout(() => {
      appendMessage('bot', null, 'card', {
        title: 'ประวัติเงินกองทุนชุมชน หมู่บ้านสวนสุข 💰',
        description:
          'ยอดรวมปัจจุบัน: 48,320 บาท\n' +
          '• +12,500 บาท จากการรีไซเคิลรวม (มิ.ย.)\n' +
          '• +8,200 บาท จากโครงการขยะแลกเงิน\n' +
          '• −5,000 บาท ซื้ออุปกรณ์คัดแยกชุมชน\n\n' +
          'อัปเดตล่าสุด: วันนี้ 09:42 น.',
        overlayText: 'กองทุนชุมชน',
        color: 'linear-gradient(135deg, #2D7A3A, #1B5E20)',
        bgIcon: 'fa-solid fa-piggy-bank',
        actions: [
          { label: '📊 ดูกราฟรายเดือน', action: 'alert("จำลอง: แสดงกราฟเงินกองทุนรายเดือน 6 เดือนย้อนหลัง")' },
        ]
      });
    }, 1100);
  }, 300);
}

function openProjectDetail() {
  closeLiff();
  setTimeout(() => {
    sendSimulatedUserMessage('💡 ดูรายละเอียดโครงการไฟถนนพลังงานแสงอาทิตย์');
    setTimeout(() => {
      appendMessage('bot', null, 'card', {
        title: 'โครงการ: ติดตั้งไฟถนนพลังงานแสงอาทิตย์ ☀️',
        description:
          'ความคืบหน้า: 72% (57,600 / 80,000 บาท)\n' +
          '• เป้าหมาย: ติดตั้ง 12 จุดทั่วหมู่บ้าน\n' +
          '• ติดตั้งแล้ว: 8 จุด ✅\n' +
          '• คาดแล้วเสร็จ: สิงหาคม 2569\n\n' +
          'ร่วมบริจาคผ่านการรีไซเคิลขยะเพื่อเร่งโครงการ!',
        overlayText: 'Solar Project',
        color: 'linear-gradient(135deg, #F59E0B, #D97706)',
        bgIcon: 'fa-solid fa-solar-panel',
        actions: [
          { label: '♻️ รีไซเคิลเพื่อบริจาคให้โครงการ', action: 'openLiff("report")' },
        ]
      });
    }, 1100);
  }, 300);
}

function viewAllActivities() {
  closeLiff();
  setTimeout(() => {
    sendSimulatedUserMessage('📜 ดูกิจกรรมทั้งหมดในหมู่บ้าน');
    setTimeout(() => {
      appendMessage('bot',
        '📋 **กิจกรรมล่าสุดในหมู่บ้านสวนสุข (7 วันที่ผ่านมา)**\n\n' +
        '🏠 บ้านเลขที่ 88 รีไซเคิล 8 กก. (+12 คะแนน) — วันนี้\n' +
        '🌳 บ้านเลขที่ 123 รีไซเคิล 15 กก. (+20 คะแนน) — วันนี้\n' +
        '👍 ยอดรวม 3 ตันแล้ว! (+50 คะแนน) — วันนี้\n' +
        '🏠 บ้านเลขที่ 56 รีไซเคิล 22 กก. (+30 คะแนน) — เมื่อวาน\n' +
        '🌳 บ้านเลขที่ 204 ปลูกต้นไม้ชุมชน (+25 คะแนน) — เมื่อวาน'
      );
    }, 1100);
  }, 300);
}

function handleShortcut(type) {
  closeLiff();
  const actions = {
    sort: {
      msg: '♻️ เมนูแยกขยะ',
      reply: 'sort'
    },
    goal: {
      msg: '🎯 ดูเป้าหมายของหมู่บ้าน',
      reply: 'schedule'
    },
    scan: {
      msg: '📷 เปิดกล้องสแกนขยะ',
      reply: 'report_info'
    },
    rank: {
      msg: '🏆 ดูอันดับหมู่บ้าน',
      reply: 'points'
    },
    privilege: {
      msg: '🎁 ดูสิทธิพิเศษของฉัน',
      reply: 'points'
    }
  };

  const action = actions[type];
  if (!action) return;

  setTimeout(() => {
    sendSimulatedUserMessage(action.msg);
    triggerBotResponse(action.reply);
  }, 300);
}
