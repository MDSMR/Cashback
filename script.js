document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('invoiceForm');
  const submitBtn = document.querySelector('.save-print-btn');
  const arabicDateDiv = document.getElementById('arabicDateDisplay');

  const rateText = document.getElementById('rateText');
  const rateOnlyText = document.getElementById('rateOnlyText');
  const amountText = document.getElementById('amountText');
  const discountText = document.getElementById('discountText');
  const netText = document.getElementById('netText');

  const dateEl = document.getElementById('date');
  const visitsEl = document.getElementById('visits');
  const amountEl = document.getElementById('invoiceAmount');
  const discountEl = document.getElementById('discountAmount');

  const dateError = document.getElementById('dateError');
  const visitsError = document.getElementById('visitsError');
  const amountError = document.getElementById('amountError');

  // New discount table (only two options)
  const discountRates = {
    "الزيارة الأولى": 0.20, // 20%
    "عميل دائم": 0.25      // 25%
  };

  function generateUniqueId() {
    const id = Math.floor(10000 + Math.random() * 90000);
    document.getElementById('uniqueIdDisplay').textContent = id;
    document.getElementById('uniqueIdHidden').value = id;
  }

  function setDefaultDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateEl.value = `${yyyy}-${mm}-${dd}`;
    arabicDateDiv.textContent = formatArabicDate(dateEl.value);
  }

  function formatArabicDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('ar-EG', options);
  }

  function formatMoney(n){
    const num = Number(n || 0);
    return new Intl.NumberFormat('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num) + ' ج.م';
  }

  function ratePercentFor(visitType){
    const r = discountRates[visitType] || 0;
    return Math.round(r * 100) + '%';
  }

  function updateDiscount() {
    const visitType = visitsEl.value;
    const amount = parseFloat(amountEl.value) || 0;
    const rate = discountRates[visitType] || 0;
    const discount = amount * rate;
    const net = Math.max(amount - discount, 0);

    discountEl.value = discount ? discount.toFixed(2) : '';

    // Update on-screen hint and print-only summary
    const ratePctText = ratePercentFor(visitType);
    if (rateText) rateText.textContent = ratePctText;
    if (rateOnlyText) rateOnlyText.textContent = ratePctText;
    if (amountText) amountText.textContent = amount ? formatMoney(amount) : '—';
    if (discountText) discountText.textContent = discount ? formatMoney(discount) : '—';
    if (netText) netText.textContent = amount ? formatMoney(net) : '—';
  }

  function clearErrors(){
    [dateError, visitsError, amountError].forEach(el => { if (el) el.textContent = ''; });
  }

  function validate(){
    clearErrors();
    let ok = true;

    if (!dateEl.value){
      dateError.textContent = 'يرجى اختيار التاريخ.';
      ok = false;
    }
    if (!visitsEl.value){
      visitsError.textContent = 'يرجى اختيار نوع الزيارة.';
      ok = false;
    }
    const amount = parseFloat(amountEl.value);
    if (!(amount > 0)){
      amountError.textContent = 'أدخل قيمة أكبر من صفر.';
      ok = false;
    }
    // Ensure discount is calculated
    updateDiscount();
    if (!discountEl.value){
      // If rate is zero or amount invalid, discount will be empty
      ok = false;
    }
    return ok;
  }

  // Init
  generateUniqueId();
  setDefaultDate();
  updateDiscount();

  visitsEl.addEventListener('change', () => { updateDiscount(); });
  amountEl.addEventListener('input', () => { updateDiscount(); });
  dateEl.addEventListener('change', () => {
    arabicDateDiv.textContent = formatArabicDate(dateEl.value);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!navigator.onLine) {
      alert("❌ لا يوجد اتصال بالإنترنت. يرجى التحقق من الشبكة قبل إرسال النموذج.");
      return;
    }

    if (!validate()){
      // Focus first invalid field
      if (!dateEl.value) { dateEl.focus(); return; }
      if (!visitsEl.value) { visitsEl.focus(); return; }
      if (!(parseFloat(amountEl.value) > 0)) { amountEl.focus(); return; }
      return;
    }

    submitBtn.disabled = true;
    const formData = new FormData(form);

    fetch("https://formsubmit.co/skandil13@gmail.com", {
      method: "POST",
      body: formData,
      headers: { 'Accept': 'application/json' }
    }).then(() => {
      // Ensure summary is fresh before printing
      updateDiscount();

      // Print
      window.print();

      // Reset
      setTimeout(() => {
        form.reset();
        setDefaultDate();
        generateUniqueId();
        updateDiscount();
        submitBtn.disabled = false;
      }, 400);
    }).catch(() => {
      alert("حدث خطأ أثناء إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى.");
      submitBtn.disabled = false;
    });
  });
});
