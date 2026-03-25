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

    // Initial generated data
    function refreshDynamicData() {
        const now = new Date();
        const future = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 hours
        
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
        const randomId = Math.floor(100000 + Math.random() * 900000);
        displayTrxId.textContent = `DANA-${dateStr}-${randomId}`;
        
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        displayExpiry.textContent = future.toLocaleDateString('id-ID', options);
    }
    refreshDynamicData();

    // Sync Inputs with Display
    inputNominal.addEventListener('input', (e) => {
        displayNominal.textContent = e.target.value || "0";
    });

    inputSender.addEventListener('input', (e) => {
        displaySender.textContent = e.target.value || "DANA Kaget";
    });

    inputMessage.addEventListener('input', (e) => {
        displayMessage.textContent = e.target.value || "Semoga harimu menyenangkan!";
    });

    // File Selection
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
            photoUrlInput.value = ''; 
        }
    });

    // Generate Logic
    generateBtn.addEventListener('click', async () => {
        let content = photoUrlInput.value.trim();
        const file = fileInput.files[0];

        if (!content && file) {
            content = await resizeAndCompress(file);
        }

        if (!content) {
            content = "https://dana.id/kaget/prank-" + Math.random().toString(36).substring(7);
        }

        qrCodeDiv.innerHTML = '';
        refreshDynamicData();
        
        // QR Code Styling
        try {
            qrCodeDiv.innerHTML = ""; 
            
            qrCodeInstance = new QRCodeStyling({
                width: 250, 
                height: 250,
                type: "svg", // Menggunakan SVG untuk stabilitas rendering logo
                data: content,
                image: "https://i.ibb.co/wr08Fww6/Sleekshot-2026-03-25-05-26-50-removebg-preview.png",
                dotsOptions: {
                    color: "#000000",
                    type: "rounded"
                },
                backgroundOptions: {
                    color: "#ffffff",
                },
                imageOptions: {
                    crossOrigin: "anonymous", // Wajib jika gambar dari URL eksternal
                    hideBackgroundDots: true,
                    imageSize: 0.35,
                    margin: 5
                },
                cornersSquareOptions: {
                    type: "extra-rounded",
                    color: "#118eea"
                },
                qrOptions: {
                    errorCorrectionLevel: "H" 
                }
            });

            qrCodeInstance.append(qrCodeDiv);
            
            // Update segera
            qrCodeInstance.update();

        } catch (err) {
            console.error("Gagal membuat QR Code:", err);
        }
        
        // Scroll to preview
        setTimeout(() => {
            captureArea.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    });

    // Image processing for QR (if user uploads their own QR content)
    async function resizeAndCompress(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const TARGET_SIZE = 50; 
                    canvas.width = TARGET_SIZE;
                    canvas.height = TARGET_SIZE;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, TARGET_SIZE, TARGET_SIZE);
                    resolve(canvas.toDataURL('image/jpeg', 0.2)); 
                };
            };
        });
    }

    // Capture and Download
    downloadBtn.addEventListener('click', () => {
        if (!qrCodeInstance) {
            alert("Silahkan klik 'BUAT VOUCHER' terlebih dahulu!");
            return;
        }

        // Add loading state
        downloadBtn.textContent = "SEDANG MEMPROSES...";
        downloadBtn.disabled = true;

        html2canvas(captureArea, {
            scale: 3, // Very high resolution for gallery
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            borderRadius: 32
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
