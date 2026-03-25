document.addEventListener('DOMContentLoaded', () => {
    const inputNominal = document.getElementById('input-nominal');
    const inputSender = document.getElementById('input-sender');
    const inputMessage = document.getElementById('input-message');
    
    const displayNominal = document.getElementById('display-nominal');
    const displaySender = document.getElementById('display-sender');
    const displayMessage = document.getElementById('display-message');
    const displayTrxId = document.getElementById('display-trx-id');
    const displayExpiry = document.getElementById('display-expiry');

    const photoUrlInput = document.getElementById('photo-url');
    const fileInput = document.getElementById('photo-file');
    const fileNameDisplay = document.getElementById('file-name');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const qrCodeDiv = document.getElementById('qrcode');
    const captureArea = document.getElementById('capture-area');

    let qrCodeInstance = null;
    const DANA_LOGO_Sakti = "https://i.ibb.co/wr08Fww6/Sleekshot-2026-03-25-05-26-50-removebg-preview.png";

    function refreshDynamicData() {
        const now = new Date();
        const future = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
        const randomId = Math.floor(100000 + Math.random() * 900000);
        displayTrxId.textContent = `DANA-${dateStr}-${randomId}`;
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        displayExpiry.textContent = future.toLocaleDateString('id-ID', options);
    }
    refreshDynamicData();

    inputNominal.addEventListener('input', (e) => {
        displayNominal.textContent = e.target.value || "0";
    });
    inputSender.addEventListener('input', (e) => {
        displaySender.textContent = e.target.value || "DANA Kaget";
    });
    inputMessage.addEventListener('input', (e) => {
        displayMessage.textContent = e.target.value || "Semoga harimu menyenangkan!";
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
        }
    });

    generateBtn.addEventListener('click', async () => {
        let qrContent = photoUrlInput.value.trim();
        const uploadedFile = fileInput.files[0];

        // Kompres foto (skala 15x15) - SANGAT KECIL agar barcode renggang & gampang scan
        if (!qrContent && uploadedFile) {
            qrContent = await resizeAndCompress(uploadedFile);
        }

        if (!qrContent) {
            qrContent = "https://i.ibb.co/vzV4S8g/images.jpg"; 
        }

        qrCodeDiv.innerHTML = "";
        refreshDynamicData();
        
        qrCodeInstance = new QRCodeStyling({
            width: 250, 
            height: 250,
            type: "canvas",
            data: qrContent,
            image: DANA_LOGO_Sakti, 
            dotsOptions: {
                color: "#111111",
                type: "rounded"
            },
            backgroundOptions: { color: "#ffffff" },
            imageOptions: {
                crossOrigin: "anonymous",
                hideBackgroundDots: true,
                imageSize: 0.35,
                margin: 5
            },
            cornersSquareOptions: {
                type: "extra-rounded",
                color: "#118eea"
            },
            qrOptions: {
                errorCorrectionLevel: "M" 
            }
        });

        qrCodeInstance.append(qrCodeDiv);
        
        setTimeout(() => {
            captureArea.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    });

    async function resizeAndCompress(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const TARGET_SIZE = 15; // Ukuran favicon agar barcode sangat enteng
                    canvas.width = TARGET_SIZE;
                    canvas.height = TARGET_SIZE;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, TARGET_SIZE, TARGET_SIZE);
                    resolve(canvas.toDataURL('image/jpeg', 0.1));
                };
            };
        });
    }

    downloadBtn.addEventListener('click', () => {
        if (!qrCodeInstance) return;
        downloadBtn.textContent = "SEDANG SIMPAN...";
        downloadBtn.disabled = true;

        html2canvas(captureArea, {
            scale: 3,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff"
        }).then(canvas => {
            const link = document.createElement('a');
            const fileName = `DANA_Voucher_${displayNominal.textContent.replace(/\./g, "")}.png`;
            link.download = fileName;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
            downloadBtn.textContent = "SIMPAN KE GALERI";
            downloadBtn.disabled = false;
        });
    });
});
