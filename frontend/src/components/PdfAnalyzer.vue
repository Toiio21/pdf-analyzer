<template>
  <div class="pdf-analyzer">
    <div class="container">
      <!-- Форма загрузки -->
      <div class="upload-section">
        <h2>Upload PDF</h2>
        <form @submit.prevent="uploadPdf" class="upload-form">
          <div class="form-group">
            <label for="pdfFile">PDF File:</label>
            <input 
              type="file" 
              id="pdfFile" 
              ref="fileInput" 
              @change="handleFileChange" 
              accept=".pdf" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="title">Title:</label>
            <input 
              type="text" 
              id="title" 
              v-model="title" 
              placeholder="Enter document title"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="format">Output Format:</label>
            <select id="format" v-model="format">
              <option value="text">Plain Text</option>
              <option value="json">JSON</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="userId">User ID:</label>
            <input 
              type="number" 
              id="userId" 
              v-model="userId" 
              placeholder="Enter user ID"
              required
            >
          </div>
          
          <button type="submit" :disabled="uploading" class="btn-primary">
            {{ uploading ? 'Processing...' : 'Upload & Analyze' }}
          </button>
        </form>
      </div>
      
      <!-- Результаты -->
      <div class="results-section" v-if="document">
        <h2>Analysis Results</h2>
        <div class="document-info">
          <p><strong>Title:</strong> {{ document.title }}</p>
          <p><strong>Format:</strong> {{ document.format }}</p>
          <p><strong>Created:</strong> {{ formatDate(document.createdAt) }}</p>
        </div>
        
        <div class="content-preview">
          <h3>Extracted Content:</h3>
          <pre v-if="document.format === 'text'">{{ document.content }}</pre>
          <pre v-else>{{ prettyJson }}</pre>
        </div>
        
        <button @click="downloadContent" class="btn-secondary">Download Content</button>
      </div>
      
      <!-- История документов -->
      <div class="history-section" v-if="documents.length">
        <h2>Your Documents</h2>
        <div class="document-list">
          <div v-for="doc in documents" :key="doc.id" class="document-item">
            <h3>{{ doc.title }}</h3>
            <p>Format: {{ doc.format }}</p>
            <p>Created: {{ formatDate(doc.created_at) }}</p>
            <div class="document-actions">
              <button @click="loadDocument(doc.id)" class="btn-small">View</button>
              <button @click="deleteDocument(doc.id)" class="btn-small btn-danger">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export default {
  name: 'PdfAnalyzer',
  data() {
    return {
      file: null,
      title: '',
      format: 'text',
      userId: 1,
      uploading: false,
      document: null,
      documents: []
    };
  },
  computed: {
    prettyJson() {
      if (this.document && this.document.format === 'json') {
        try {
          return JSON.stringify(JSON.parse(this.document.content), null, 2);
        } catch (e) {
          return this.document.content;
        }
      }
      return '';
    }
  },
  mounted() {
    this.loadUserDocuments();
  },
  methods: {
    handleFileChange(event) {
      this.file = event.target.files[0];
      if (this.file && !this.title) {
        this.title = this.file.name.replace('.pdf', '');
      }
    },
    
    async uploadPdf() {
      if (!this.file) {
        alert('Please select a PDF file');
        return;
      }
      
      this.uploading = true;
      
      const formData = new FormData();
      formData.append('pdf', this.file);
      formData.append('title', this.title);
      formData.append('format', this.format);
      formData.append('userId', this.userId);
      
      try {
        const response = await axios.post(`${API_BASE}/documents/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        this.document = response.data.document;
        this.loadUserDocuments();
      } catch (error) {
        console.error('Error uploading PDF:', error);
        alert('Error uploading PDF: ' + (error.response?.data?.error || error.message));
      } finally {
        this.uploading = false;
      }
    },
    
    async loadUserDocuments() {
      try {
        const response = await axios.get(`${API_BASE}/documents/user/${this.userId}`);
        this.documents = response.data.documents;
      } catch (error) {
        console.error('Error loading documents:', error);
      }
    },
    
    async loadDocument(id) {
      try {
        const response = await axios.get(`${API_BASE}/documents/${id}`);
        this.document = response.data.document;
      } catch (error) {
        console.error('Error loading document:', error);
        alert('Error loading document: ' + (error.response?.data?.error || error.message));
      }
    },
    
    async deleteDocument(id) {
      if (!confirm('Are you sure you want to delete this document?')) {
        return;
      }
      
      try {
        await axios.delete(`${API_BASE}/documents/${id}`, {
          data: { userId: this.userId }
        });
        
        // Remove from local list
        this.documents = this.documents.filter(doc => doc.id !== id);
        
        // Clear current document if it's the one being deleted
        if (this.document && this.document.id === id) {
          this.document = null;
        }
        
        alert('Document deleted successfully');
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Error deleting document: ' + (error.response?.data?.error || error.message));
      }
    },
    
    downloadContent() {
      if (!this.document) return;
      
      let content, mimeType, extension;
      
      if (this.document.format === 'json') {
        content = this.prettyJson;
        mimeType = 'application/json';
        extension = 'json';
      } else {
        content = this.document.content;
        mimeType = 'text/plain';
        extension = 'txt';
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.document.title}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    }
  }
};
</script>

<style scoped>
.pdf-analyzer {
  width: 100%;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.upload-section, .results-section, .history-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
}

.form-group input, .form-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

button {
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #6e8efb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #5a7de4;
}

.btn-secondary {
  background-color: #4CAF50;
  color: white;
  margin-top: 15px;
}

.btn-secondary:hover {
  background-color: #45a049;
}

.document-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 5px;
}

.document-info p {
  margin-bottom: 8px;
}

.content-preview {
  margin-top: 20px;
}

.content-preview pre {
  white-space: pre-wrap;
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 5px;
  max-height: 300px;
  overflow-y: auto;
  font-family: monospace;
}

.document-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.document-item {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.document-item h3 {
  margin-bottom: 10px;
  color: #333;
}

.document-item p {
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #666;
}

.document-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-small {
  padding: 8px 12px;
  font-size: 0.9rem;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-danger:hover {
  background-color: #d32f2f;
}

@media (min-width: 768px) {
  .upload-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  
  .upload-form button {
    grid-column: span 2;
  }
}
</style>