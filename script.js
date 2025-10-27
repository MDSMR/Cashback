document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('invoiceForm');
  const submitBtn = document.querySelector('.save-print-btn');
  const arabicDateDiv = document.getElementById('arabicDateDisplay');

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
    document.getElementById('date').value = `${yyyy}-${mm}-${dd}`;
  }

  function formatArabicDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('ar-EG', options);
  }

  const discountRates = {
    "الزيارة الأولى": 0.10,
    "الزيارة الثانية": 0.15,
    "الزيارة الثالثة": 0.20,
    "عميل دائم": 0.20
  };

  function updateDiscount() {
    const visitType = document.getElementById('visits').value;
    const invoiceAmount = parseFloat(document.getElementById('invoiceAmount').value) || 0;
    const rate = discountRates[visitType] || 0;
    const discount = invoiceAmount * rate;
    document.getElementById('discountAmount').value = discount.toFixed(2);
  }

  generateUniqueId();
  setDefaultDate();

  document.getElementById('visits').addEventListener('change', updateDiscount);
  document.getElementById('invoiceAmount').addEventListener('input', updateDiscount);

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!navigator.onLine) {
      alert("❌ لا يوجد اتصال بالإنترنت. يرجى التحقق من الشبكة قبل إرسال النموذج.");
      return;
    }

    const dateField = document.getElementById('date');
    const amount = document.getElementById('invoiceAmount').value;
    const discount = document.getElementById('discountAmount').value;
    const visitType = document.getElementById('visits').value;

    if (!dateField.value || parseFloat(amount) <= 0 || !visitType || discount === "" || parseFloat(discount) === 0) {
      alert("يرجى إدخال التاريخ، نوع الزيارة، وقيمة الفاتورة أكبر من صفر.");
      return;
    }

    submitBtn.disabled = true;

    const formData = new FormData(form);

    fetch("https://formsubmit.co/ajax/mellow-churros", {
      method: "POST",
      body: formData,
      headers: { 'Accept': 'application/json' }
    }).then(() => {
      arabicDateDiv.textContent = formatArabicDate(dateField.value);
      window.print();

      setTimeout(() => {
        form.reset();
        setDefaultDate();
        generateUniqueId();
        document.getElementById('discountAmount').value = "";
        arabicDateDiv.textContent = "";
        submitBtn.disabled = false;
      }, 500);
    }).catch(() => {
      alert("حدث خطأ أثناء إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى.");
      submitBtn.disabled = false;
    });
  });
});
