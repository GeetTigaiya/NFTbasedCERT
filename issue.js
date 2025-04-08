// Web3 Configuration
const projectId = window.env.PINATA_API_KEY;
const pinataApiKey = window.env.PINATA_API_KEY;
const pinataSecretKey = window.env.PINATA_SECRET_KEY;
const contractAddress = window.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

function createCertificateEntry() {
    const entry = document.createElement('div');
    entry.className = 'certificate-entry';
    entry.innerHTML = `
        <div class="form-group">
            <label>Recipient's Wallet Address</label>
            <input type="text" class="recipient-address" required placeholder="0x..." name="batch-recipient-address">
        </div>
        <div class="form-group">
            <label>Student Name</label>
            <input type="text" class="student-name" required name="batch-student-name">
        </div>
        <div class="form-group">
            <label>Degree</label>
            <input type="text" class="degree" required name="batch-degree">
        </div>
        <div class="form-group">
            <label>Institution</label>
            <input type="text" class="institution" required name="batch-institution">
        </div>
        <div class="form-group">
            <label>Graduation Date</label>
            <input type="date" class="graduation-date" required name="batch-graduation-date">
        </div>
        <div class="form-group">
            <label>Certificate Document</label>
            <div class="file-upload">
                <input type="file" class="certificate-file" accept=".pdf,.doc,.docx" required name="batch-certificate-file">
                <div class="upload-placeholder">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Drag and drop your certificate file here or click to browse</p>
                </div>
            </div>
        </div>
        <button type="button" class="remove-entry-btn">Remove Entry</button>
    `;
} 