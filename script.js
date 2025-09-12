document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('invoiceForm');
  const submitBtn = document.querySelector('.save-print-btn');

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

  // Discounts
  const discountRates = {
    "الزيارة الأولى": 0.20,
    "عميل دائم": 0.25
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

    if (!dateEl.value){ dateError.textContent = 'يرجى اختيار التاريخ.'; ok = false; }
    if (!visitsEl.value){ visitsError.textContent = 'يرجى اختيار نوع الزيارة.'; ok = false; }
    if (!(parseFloat(amountEl.value) > 0)){ amountError.textContent = 'أدخل قيمة أكبر من صفر.'; ok = false; }
    updateDiscount();
    if (!discountEl.value){ ok = false; }
    return ok;
  }

  // Init
  generateUniqueId();
  setDefaultDate();
  updateDiscount();

  visitsEl.addEventListener('change', updateDiscount);
  amountEl.addEventListener('input', updateDiscount);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!navigator.onLine) {
      alert("❌ لا يوجد اتصال بالإنترنت. يرجى التحقق من الشبكة قبل إرسال النموذج.");
      return;
    }
    if (!validate()){ return; }

    submitBtn.disabled = true;
    const formData = new FormData(form);

    fetch("https://formsubmit.co/skandil13@gmail.com", {
      method: "POST",
      body: formData,
      headers: { 'Accept': 'application/json' }
    }).then(() => {
      updateDiscount();
      window.print();
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
