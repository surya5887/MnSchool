const fs = require('fs');
let code = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

const boundaryCode = `
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, errorInfo: any) { console.error("Announcements Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return <div style={{padding: 40, color: 'red'}}>
        <h2>Something went wrong in Announcements.</h2>
        <pre>{String(this.state.error)}</pre>
        <pre>{this.state.error?.stack}</pre>
      </div>;
    }
    return this.props.children; 
  }
}

const AnnouncementsWrapped = () => (
  <ErrorBoundary>
    <Announcements />
  </ErrorBoundary>
);
export default AnnouncementsWrapped;
`;

code = code.replace(/export default Announcements;/, boundaryCode);

// Also fix the `data.feeReminderTemplate` null issue
code = code.replace(/if \(data\.feeReminderTemplate\) \{/, 'if (data && data.feeReminderTemplate) {');

fs.writeFileSync('src/pages/Announcements.tsx', code, 'utf8');
console.log("Error Boundary added");
