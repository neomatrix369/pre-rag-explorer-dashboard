export async function parseFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'pdf') {
    return await parsePDF(file);
  } else if (extension === 'csv') {
    return await parseCSV(file);
  } else if (extension === 'md') {
    return await parseMarkdown(file);
  } else {
    return await parseText(file);
  }
}

async function parseText(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsText(file);
  });
}

async function parseMarkdown(file: File): Promise<string> {
  const text = await parseText(file);
  // We keep the markdown but could strip it if we wanted pure text.
  // RAG often works better on clean text but some structures like tables are helpful.
  return text;
}

async function parseCSV(file: File): Promise<string> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      complete: (results) => {
        const rows = results.data.map((row) => Object.values(row).join(' '));
        resolve(rows.join('\n'));
      },
      header: true,
    });
  });
}

async function parsePDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(' ');
    fullText += pageText + '\n';
  }
  return fullText;
}
