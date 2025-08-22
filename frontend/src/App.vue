<template>
  <div id="app">
    <header>
      <h1>PDF Analyzer</h1>
      <p>Upload, analyze and manage your PDF documents</p>
    </header>
    <main>
      <PdfAnalyzer />
    </main>
  </div>
</template>

<script>
import PdfAnalyzer from './components/PdfAnalyzer.vue'

export default {
  name: 'App',
  components: {
    PdfAnalyzer
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f7fa;
  color: #333;
  line-height: 1.6;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

main {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

@media (min-width: 768px) {
  #app {
    padding: 40px;
  }
}
</style>