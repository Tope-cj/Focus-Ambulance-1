<<<<<<< HEAD
const API_BASE_URL = 'https://focus-ambulance-1.onrender.com';

document.addEventListener('DOMContentLoaded',function(){
  'use strict';

  // Small helpers to show/hide a spinner inside buttons
  function showButtonSpinner(btn){
    if(!btn) return;
    btn.classList.add('loading');
    let s = btn.querySelector('.spinner');
    if(!s){
      s = document.createElement('span');
      s.className = 'spinner';
      s.setAttribute('aria-hidden','true');
      btn.appendChild(s);
    }
  }

  function hideButtonSpinner(btn){
    if(!btn) return;
    btn.classList.remove('loading');
    const s = btn.querySelector('.spinner');
    if(s) s.remove();
  }

  // ===== Navigation Toggle =====
  const navToggle=document.getElementById('navToggle');
  const navLinks=document.getElementById('navLinks');
  navToggle&&navToggle.addEventListener('click',()=>navLinks.classList.toggle('open'));

  // ===== Smooth Scroll =====
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',function(e){
      const href=this.getAttribute('href');
      if(href.startsWith('#')){
        const target=document.querySelector(href);
        if(target){
          e.preventDefault();
          target.scrollIntoView({behavior:'smooth',block:'start'});
          navLinks.classList.remove('open');
        }
      }
    });
  });

  // ===== Sticky Header =====
  const header=document.getElementById('header');
  window.addEventListener('scroll',()=>{
    if(window.scrollY>20) header.classList.add('scrolled'); else header.classList.remove('scrolled');
  });

  // ===== Testimonials Carousel =====
  const carousel=document.getElementById('testimonialsCarousel');
  if(carousel){
    const items=Array.from(carousel.querySelectorAll('.testimonial'));
    let idx=0;
    setInterval(()=>{
      items[idx].classList.remove('active');
      idx=(idx+1)%items.length;
      items[idx].classList.add('active');
    },5000);
  }

  // ===== Contact Form Handling =====
  const contactForm=document.getElementById('contactForm');
  const contactMsg=document.getElementById('formMessage');
  if(contactForm){
    contactForm.addEventListener('submit',async e=>{
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const data=new FormData(contactForm);
      const name=data.get('name')?.toString().trim();
      const phone=data.get('phone')?.toString().trim();
      const email=data.get('email')?.toString().trim();
      const service=data.get('service')?.toString().trim()||'';
      const message=data.get('message')?.toString().trim()||'';

      if(!name||!phone){
        contactMsg.textContent='Please provide name and contact number.';
        contactMsg.style.color='var(--accent)';
        return;
      }

      if(submitBtn){ submitBtn.disabled = true; showButtonSpinner(submitBtn); }
      contactMsg.textContent='Sending...';
      contactMsg.style.color='var(--blue)';

      try{
        const payload = {
          name,
          phone,
          email: email || '',
          service: service || 'General Inquiry',
          message,
          submittedAt: new Date().toISOString()
        };

        const response = await fetch("http://localhost:3000/api/contact", {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload)
        });

        if(!response.ok){
          const errorText = await response.text();
          throw new Error(errorText || 'Server rejected contact request.');
        }

        contactMsg.textContent='✅ Message received. Our dispatch team has been notified.';
        contactMsg.style.color='green';
        contactForm.reset();
      }catch(err){
        console.error('Contact API error:', err);
        contactMsg.textContent = err.message || 'Error sending message. Please try again later.';
        contactMsg.style.color='var(--accent)';
      }finally{
        if(submitBtn){ hideButtonSpinner(submitBtn); submitBtn.disabled = false; }
      }
    });
  }

  // ===== Emergency Hotline Modal =====
  const hotlineModal=document.getElementById('hotlineModal');
  const hotlineOverlay=document.getElementById('hotlineOverlay');
  const hotlineClose=document.getElementById('hotlineClose');
  const callNowBtn=document.getElementById('callNowBtn');
  const headerCallBtn=document.getElementById('headerCallBtn');
  const floatingCall=document.getElementById('floatingCall');

  function openHotlineModal(){
    if(hotlineModal){
      hotlineModal.setAttribute('aria-hidden','false');
      document.body.style.overflow='hidden';
    }
  }

  function closeHotlineModal(){
    if(hotlineModal){
      hotlineModal.setAttribute('aria-hidden','true');
      document.body.style.overflow='';
    }
  }

  callNowBtn&&callNowBtn.addEventListener('click',e=>{e.preventDefault();openHotlineModal();});
  headerCallBtn&&headerCallBtn.addEventListener('click',e=>{e.preventDefault();openHotlineModal();});
  floatingCall&&floatingCall.addEventListener('click',e=>{e.preventDefault();openHotlineModal();});
  hotlineClose&&hotlineClose.addEventListener('click',closeHotlineModal);
  hotlineOverlay&&hotlineOverlay.addEventListener('click',closeHotlineModal);

  // ===== Request Ambulance Modal =====
  const requestModal=document.getElementById('requestModal');
  const modalOverlay=document.getElementById('modalOverlay');
  const modalClose=document.getElementById('modalClose');
  const modalCancel=document.getElementById('modalCancel');
  const requestAmbBtn=document.getElementById('requestAmbBtn');
  const requestForm=document.getElementById('requestForm');
  const requestMessage=document.getElementById('requestMessage');
  const statusTracker=document.getElementById('statusTracker');

  function openRequestModal(){
    if(requestModal){
      requestModal.setAttribute('aria-hidden','false');
      document.body.style.overflow='hidden';
      statusTracker.style.display='none';
      const first=requestModal.querySelector('input[type="text"]');
      first&&first.focus();
    }
  }

  function closeRequestModal(){
    if(requestModal){
      requestModal.setAttribute('aria-hidden','true');
      document.body.style.overflow='';
      requestMessage.textContent='';
      requestForm.reset();
      statusTracker.style.display='none';
    }
  }

  requestAmbBtn&&requestAmbBtn.addEventListener('click',e=>{e.preventDefault();openRequestModal();});
  modalClose&&modalClose.addEventListener('click',closeRequestModal);
  modalCancel&&modalCancel.addEventListener('click',closeRequestModal);
  modalOverlay&&modalOverlay.addEventListener('click',closeRequestModal);

  // ===== Request Form Submission & Validation =====
  if(requestForm){
    requestForm.addEventListener('submit',async function(e){
      e.preventDefault();
      requestMessage.textContent='';

      const formData=new FormData(requestForm);
      const payload={
        requester:{
          name:(formData.get('req_name')||'').toString().trim(),
          phone:(formData.get('req_phone')||'').toString().trim(),
          altPhone:(formData.get('req_alt_phone')||'').toString().trim(),
          relation:(formData.get('req_relation')||'').toString().trim()
        },
        patient:{
          name:(formData.get('pat_name')||'').toString().trim(),
          age:(formData.get('pat_age')||'').toString().trim(),
          sex:(formData.get('pat_sex')||'').toString().trim(),
          weight:(formData.get('pat_weight')||'').toString().trim(),
          condition:(formData.get('pat_condition')||'').toString().trim(),
          status:(formData.get('pat_status')||'').toString().trim()
        },
        pickup:{
          address:(formData.get('pickup_addr')||'').toString().trim(),
          landmark:(formData.get('pickup_landmark')||'').toString().trim(),
          city:(formData.get('pickup_city')||'').toString().trim(),
          unit:(formData.get('pickup_unit')||'').toString().trim(),
          gps:(formData.get('pickup_gps')||'').toString().trim()
        },
        destination:{
          facility:(formData.get('dest_facility')||'').toString().trim(),
          address:(formData.get('dest_addr')||'').toString().trim()
        },
        service:(formData.get('service')||'').toString().trim(),
        medical:{
          oxygen:!!formData.get('req_oxygen'),
          wheelchair:!!formData.get('req_wheelchair'),
          stretcher:!!formData.get('req_stretcher'),
          cardiac:!!formData.get('req_cardiac'),
          ventilator:!!formData.get('req_ventilator'),
          nurse:!!formData.get('req_nurse'),
          doctor:!!formData.get('req_doctor')
        },
        additional:{
          instructions:(formData.get('special_instructions')||'').toString().trim(),
          allergies:(formData.get('allergies')||'').toString().trim(),
          conditions:(formData.get('medical_conditions')||'').toString().trim()
        },
        emergencyContact:{
          name:(formData.get('emg_contact_name')||'').toString().trim(),
          phone:(formData.get('emg_contact_phone')||'').toString().trim()
        }
      };

      // Validation
      if(!payload.requester.name||!payload.requester.phone||!payload.pickup.address){
        requestMessage.textContent='Please fill in: Requester name, phone, and pickup address.';
        requestMessage.style.color='var(--accent)';
        return;
      }
      if(!payload.patient.name||!payload.patient.condition||!payload.patient.status){
        requestMessage.textContent='Please complete all patient information fields.';
        requestMessage.style.color='var(--accent)';
        return;
      }
      if(!formData.get('consent')){
        requestMessage.textContent='You must consent to submit this request.';
        requestMessage.style.color='var(--accent)';
        return;
      }

      // HTTPS Security Check
      if(location.protocol!=='https:'&&location.hostname!=='localhost'&&location.hostname!=='127.0.0.1'){
        const proceed=confirm('⚠️ Your connection is NOT using HTTPS. Sensitive patient data will be transmitted unencrypted.\\n\\nFor security, please use HTTPS or host locally.\\n\\nContinue anyway?');
        if(!proceed){
          requestMessage.textContent='Submission cancelled — use HTTPS to secure sensitive data.';
          requestMessage.style.color='var(--accent)';
          return;
        }
      }

      const submitBtn = requestForm.querySelector('button[type="submit"]');
      if(submitBtn){ submitBtn.disabled = true; showButtonSpinner(submitBtn); }
      requestMessage.textContent='Processing your request...';
      requestMessage.style.color='var(--blue)';

      try{
        const response = await fetch(`${API_BASE_URL}/api/ambulance-request`,{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify(payload)
        });

        if(!response.ok){
          const errorText = await response.text();
          throw new Error(errorText || 'Server rejected ambulance request.');
        }

        statusTracker.style.display='grid';
        simulateStatusTracking();
        requestMessage.textContent='✅ Request submitted successfully! Dispatch team will contact you.';
        requestMessage.style.color='green';
        requestForm.reset();
        setTimeout(closeRequestModal,2500);
      }catch(err){
        console.error('Ambulance request API error:', err);
        requestMessage.textContent = err.message || 'Error submitting request. Please try again later.';
        requestMessage.style.color='var(--accent)';
      }finally{
        if(submitBtn){ hideButtonSpinner(submitBtn); submitBtn.disabled = false; }
      }
    });
  }

  // ===== Status Tracker Simulation =====
  function simulateStatusTracking(){
    const steps=document.querySelectorAll('.status-step');
    let currentStep=0;

    const interval=setInterval(()=>{
      if(currentStep<steps.length){
        steps[currentStep].classList.add('received');
        currentStep++;
      }else{
        clearInterval(interval);
      }
    },1200);
  }

  // ===== Keyboard Accessibility =====
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      navLinks.classList.remove('open');
      closeHotlineModal();
      closeRequestModal();
    }
  });

  // ===== Intersection Observer for Fade-in Animations =====
  const observerOptions={threshold:0.1,rootMargin:'0px 0px -50px 0px'};
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('fade-up');
        observer.unobserve(entry.target);
      }
    });
  },observerOptions);

  document.querySelectorAll('.service-card, .stat, .testimonial').forEach(el=>observer.observe(el));
});

=======
const API_BASE_URL = 'http://127.0.0.1:3000';

document.addEventListener('DOMContentLoaded',function(){
  'use strict';

  // Small helpers to show/hide a spinner inside buttons
  function showButtonSpinner(btn){
    if(!btn) return;
    btn.classList.add('loading');
    let s = btn.querySelector('.spinner');
    if(!s){
      s = document.createElement('span');
      s.className = 'spinner';
      s.setAttribute('aria-hidden','true');
      btn.appendChild(s);
    }
  }

  function hideButtonSpinner(btn){
    if(!btn) return;
    btn.classList.remove('loading');
    const s = btn.querySelector('.spinner');
    if(s) s.remove();
  }

  // ===== Navigation Toggle =====
  const navToggle=document.getElementById('navToggle');
  const navLinks=document.getElementById('navLinks');
  navToggle&&navToggle.addEventListener('click',()=>navLinks.classList.toggle('open'));

  // ===== Smooth Scroll =====
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',function(e){
      const href=this.getAttribute('href');
      if(href.startsWith('#')){
        const target=document.querySelector(href);
        if(target){
          e.preventDefault();
          target.scrollIntoView({behavior:'smooth',block:'start'});
          navLinks.classList.remove('open');
        }
      }
    });
  });

  // ===== Sticky Header =====
  const header=document.getElementById('header');
  window.addEventListener('scroll',()=>{
    if(window.scrollY>20) header.classList.add('scrolled'); else header.classList.remove('scrolled');
  });

  // ===== Testimonials Carousel =====
  const carousel=document.getElementById('testimonialsCarousel');
  if(carousel){
    const items=Array.from(carousel.querySelectorAll('.testimonial'));
    let idx=0;
    setInterval(()=>{
      items[idx].classList.remove('active');
      idx=(idx+1)%items.length;
      items[idx].classList.add('active');
    },5000);
  }

  // ===== Contact Form Handling =====
  const contactForm=document.getElementById('contactForm');
  const contactMsg=document.getElementById('formMessage');
  if(contactForm){
    contactForm.addEventListener('submit',async e=>{
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const data=new FormData(contactForm);
      const name=data.get('name')?.toString().trim();
      const phone=data.get('phone')?.toString().trim();
      const email=data.get('email')?.toString().trim();
      const service=data.get('service')?.toString().trim()||'';
      const message=data.get('message')?.toString().trim()||'';

      if(!name||!phone){
        contactMsg.textContent='Please provide name and contact number.';
        contactMsg.style.color='var(--accent)';
        return;
      }

      if(submitBtn){ submitBtn.disabled = true; showButtonSpinner(submitBtn); }
      contactMsg.textContent='Sending...';
      contactMsg.style.color='var(--blue)';

      try{
        const payload = {
          name,
          phone,
          email: email || '',
          service: service || 'General Inquiry',
          message,
          submittedAt: new Date().toISOString()
        };

        const response = await fetch("http://localhost:3000/api/contact", {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload)
        });

        if(!response.ok){
          const errorText = await response.text();
          throw new Error(errorText || 'Server rejected contact request.');
        }

        contactMsg.textContent='✅ Message received. Our dispatch team has been notified.';
        contactMsg.style.color='green';
        contactForm.reset();
      }catch(err){
        console.error('Contact API error:', err);
        contactMsg.textContent = err.message || 'Error sending message. Please try again later.';
        contactMsg.style.color='var(--accent)';
      }finally{
        if(submitBtn){ hideButtonSpinner(submitBtn); submitBtn.disabled = false; }
      }
    });
  }

  // ===== Emergency Hotline Modal =====
  const hotlineModal=document.getElementById('hotlineModal');
  const hotlineOverlay=document.getElementById('hotlineOverlay');
  const hotlineClose=document.getElementById('hotlineClose');
  const callNowBtn=document.getElementById('callNowBtn');
  const headerCallBtn=document.getElementById('headerCallBtn');
  const floatingCall=document.getElementById('floatingCall');

  function openHotlineModal(){
    if(hotlineModal){
      hotlineModal.setAttribute('aria-hidden','false');
      document.body.style.overflow='hidden';
    }
  }

  function closeHotlineModal(){
    if(hotlineModal){
      hotlineModal.setAttribute('aria-hidden','true');
      document.body.style.overflow='';
    }
  }

  callNowBtn&&callNowBtn.addEventListener('click',e=>{e.preventDefault();openHotlineModal();});
  headerCallBtn&&headerCallBtn.addEventListener('click',e=>{e.preventDefault();openHotlineModal();});
  floatingCall&&floatingCall.addEventListener('click',e=>{e.preventDefault();openHotlineModal();});
  hotlineClose&&hotlineClose.addEventListener('click',closeHotlineModal);
  hotlineOverlay&&hotlineOverlay.addEventListener('click',closeHotlineModal);

  // ===== Request Ambulance Modal =====
  const requestModal=document.getElementById('requestModal');
  const modalOverlay=document.getElementById('modalOverlay');
  const modalClose=document.getElementById('modalClose');
  const modalCancel=document.getElementById('modalCancel');
  const requestAmbBtn=document.getElementById('requestAmbBtn');
  const requestForm=document.getElementById('requestForm');
  const requestMessage=document.getElementById('requestMessage');
  const statusTracker=document.getElementById('statusTracker');

  function openRequestModal(){
    if(requestModal){
      requestModal.setAttribute('aria-hidden','false');
      document.body.style.overflow='hidden';
      statusTracker.style.display='none';
      const first=requestModal.querySelector('input[type="text"]');
      first&&first.focus();
    }
  }

  function closeRequestModal(){
    if(requestModal){
      requestModal.setAttribute('aria-hidden','true');
      document.body.style.overflow='';
      requestMessage.textContent='';
      requestForm.reset();
      statusTracker.style.display='none';
    }
  }

  requestAmbBtn&&requestAmbBtn.addEventListener('click',e=>{e.preventDefault();openRequestModal();});
  modalClose&&modalClose.addEventListener('click',closeRequestModal);
  modalCancel&&modalCancel.addEventListener('click',closeRequestModal);
  modalOverlay&&modalOverlay.addEventListener('click',closeRequestModal);

  // ===== Request Form Submission & Validation =====
  if(requestForm){
    requestForm.addEventListener('submit',async function(e){
      e.preventDefault();
      requestMessage.textContent='';

      const formData=new FormData(requestForm);
      const payload={
        requester:{
          name:(formData.get('req_name')||'').toString().trim(),
          phone:(formData.get('req_phone')||'').toString().trim(),
          altPhone:(formData.get('req_alt_phone')||'').toString().trim(),
          relation:(formData.get('req_relation')||'').toString().trim()
        },
        patient:{
          name:(formData.get('pat_name')||'').toString().trim(),
          age:(formData.get('pat_age')||'').toString().trim(),
          sex:(formData.get('pat_sex')||'').toString().trim(),
          weight:(formData.get('pat_weight')||'').toString().trim(),
          condition:(formData.get('pat_condition')||'').toString().trim(),
          status:(formData.get('pat_status')||'').toString().trim()
        },
        pickup:{
          address:(formData.get('pickup_addr')||'').toString().trim(),
          landmark:(formData.get('pickup_landmark')||'').toString().trim(),
          city:(formData.get('pickup_city')||'').toString().trim(),
          unit:(formData.get('pickup_unit')||'').toString().trim(),
          gps:(formData.get('pickup_gps')||'').toString().trim()
        },
        destination:{
          facility:(formData.get('dest_facility')||'').toString().trim(),
          address:(formData.get('dest_addr')||'').toString().trim()
        },
        service:(formData.get('service')||'').toString().trim(),
        medical:{
          oxygen:!!formData.get('req_oxygen'),
          wheelchair:!!formData.get('req_wheelchair'),
          stretcher:!!formData.get('req_stretcher'),
          cardiac:!!formData.get('req_cardiac'),
          ventilator:!!formData.get('req_ventilator'),
          nurse:!!formData.get('req_nurse'),
          doctor:!!formData.get('req_doctor')
        },
        additional:{
          instructions:(formData.get('special_instructions')||'').toString().trim(),
          allergies:(formData.get('allergies')||'').toString().trim(),
          conditions:(formData.get('medical_conditions')||'').toString().trim()
        },
        emergencyContact:{
          name:(formData.get('emg_contact_name')||'').toString().trim(),
          phone:(formData.get('emg_contact_phone')||'').toString().trim()
        }
      };

      // Validation
      if(!payload.requester.name||!payload.requester.phone||!payload.pickup.address){
        requestMessage.textContent='Please fill in: Requester name, phone, and pickup address.';
        requestMessage.style.color='var(--accent)';
        return;
      }
      if(!payload.patient.name||!payload.patient.condition||!payload.patient.status){
        requestMessage.textContent='Please complete all patient information fields.';
        requestMessage.style.color='var(--accent)';
        return;
      }
      if(!formData.get('consent')){
        requestMessage.textContent='You must consent to submit this request.';
        requestMessage.style.color='var(--accent)';
        return;
      }

      // HTTPS Security Check
      if(location.protocol!=='https:'&&location.hostname!=='localhost'&&location.hostname!=='127.0.0.1'){
        const proceed=confirm('⚠️ Your connection is NOT using HTTPS. Sensitive patient data will be transmitted unencrypted.\\n\\nFor security, please use HTTPS or host locally.\\n\\nContinue anyway?');
        if(!proceed){
          requestMessage.textContent='Submission cancelled — use HTTPS to secure sensitive data.';
          requestMessage.style.color='var(--accent)';
          return;
        }
      }

      const submitBtn = requestForm.querySelector('button[type="submit"]');
      if(submitBtn){ submitBtn.disabled = true; showButtonSpinner(submitBtn); }
      requestMessage.textContent='Processing your request...';
      requestMessage.style.color='var(--blue)';

      try{
        const response = await fetch(`${API_BASE_URL}/api/ambulance-request`,{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify(payload)
        });

        if(!response.ok){
          const errorText = await response.text();
          throw new Error(errorText || 'Server rejected ambulance request.');
        }

        statusTracker.style.display='grid';
        simulateStatusTracking();
        requestMessage.textContent='✅ Request submitted successfully! Dispatch team will contact you.';
        requestMessage.style.color='green';
        requestForm.reset();
        setTimeout(closeRequestModal,2500);
      }catch(err){
        console.error('Ambulance request API error:', err);
        requestMessage.textContent = err.message || 'Error submitting request. Please try again later.';
        requestMessage.style.color='var(--accent)';
      }finally{
        if(submitBtn){ hideButtonSpinner(submitBtn); submitBtn.disabled = false; }
      }
    });
  }

  // ===== Status Tracker Simulation =====
  function simulateStatusTracking(){
    const steps=document.querySelectorAll('.status-step');
    let currentStep=0;

    const interval=setInterval(()=>{
      if(currentStep<steps.length){
        steps[currentStep].classList.add('received');
        currentStep++;
      }else{
        clearInterval(interval);
      }
    },1200);
  }

  // ===== Keyboard Accessibility =====
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      navLinks.classList.remove('open');
      closeHotlineModal();
      closeRequestModal();
    }
  });

  // ===== Intersection Observer for Fade-in Animations =====
  const observerOptions={threshold:0.1,rootMargin:'0px 0px -50px 0px'};
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('fade-up');
        observer.unobserve(entry.target);
      }
    });
  },observerOptions);

  document.querySelectorAll('.service-card, .stat, .testimonial').forEach(el=>observer.observe(el));
});

>>>>>>> b5ed720246ff95947c2d2e43086f6ca65c943c41
