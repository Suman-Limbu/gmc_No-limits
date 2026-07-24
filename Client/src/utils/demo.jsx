// import { Document, Page } from "react-pdf";
// import { useState } from "react";

// const PdfViewer = () => {
//   const [numPages, setNumPages] = useState();

//   return (
//     <div>
//       <Document
//         file="/pdfs/sample.pdf"
//         onLoadSuccess={({ numPages }) => setNumPages(numPages)}
//       >
//         {Array.from(new Array(numPages), (_, index) => (
//           <Page key={index} pageNumber={index + 1} />
//         ))}
//       </Document>
//     </div>
//   );
// };

// export default PdfViewer;