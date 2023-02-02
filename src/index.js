const SLIDES_PATH = './slides'
const LYRICS_PATH = './letras'

const removeSymbols = (fileTitle) => {
  const regexpReplaces = [
    { regex: /(\à|\á|\ã|\â)/gi, replacement: 'a'},
    { regex: /(\é|\ê)/gi, replacement: 'e'},
    { regex: /(\í|\î)/gi, replacement: 'i'},
    { regex: /(\Ó|\õ|\ô)/gi, replacement: 'o'},
    { regex: /(\ú|\û)/gi, replacement: 'u'},
    { regex: /ç/gi, replacement: 'c'},
    { regex: /(\(|\)|\.)/gi, replacement: ' '},
    { regex: /\-|\!/gi, replacement: ''},
  ]
  let name = fileTitle
  regexpReplaces.forEach(({ regex, replacement}) => {
    name = name.replace(regex, replacement)
  })
  return name
}

const loadPptx = async (filePath) => {
  const PPTX = require('nodejs-pptx');
  const XmlReader = require('xml-reader');
  let pptx = new PPTX.Composer();

  await pptx.load(filePath);

 
  const reader = XmlReader.create({stream: true });
  let lyrics = '';
  
  reader.on('tag:a:t', (data) => {
    (data.children.filter(child => child.type === 'text') || []).forEach(line => lyrics += line.value + '\n')
  })
  let index = 2;
  let currentSlide = pptx.getSlide(index);
  while (true) {
    try {
      reader.parse(currentSlide.getSlideXmlAsString());  
      reader.reset()
      index++;
      currentSlide = pptx.getSlide(index);
    } catch (err) {
      break
    }
  }
  return lyrics
}

const generateTxtFiles = async () => {
  const fs = require('fs');
  if (!fs.existsSync(LYRICS_PATH)) {
    fs.mkdirSync(LYRICS_PATH)
  }
  fs.readdir(SLIDES_PATH, async (err, files) => {
    files.forEach(async fileName => {
      if (fileName.includes('.pptx')) {
        const fileTitle = fileName.substring(0, fileName.indexOf('.pptx'))

        const fileTitleWithoutSymbols = removeSymbols(fileTitle);
        const lyricsPath = `${LYRICS_PATH}/${fileTitleWithoutSymbols}.txt`
        console.log(fileTitleWithoutSymbols)
        if (!fs.existsSync(lyricsPath)) {
          const lyrics = await loadPptx(`${SLIDES_PATH}/${fileName}`)
          fs.writeFile(lyricsPath, lyrics, err => console.error)
        }
      }
    })
  })
  /*
  const filePath = './src/slides/teste.pptx'
  const fileTitle = filePath.substring(filePath.lastIndexOf('/') + 1, filePath.indexOf('.pptx'))
  const lyrics = await loadPptx(filePath)
  */

}

generateTxtFiles()
