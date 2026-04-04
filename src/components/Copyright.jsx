import { COPYRIGHT_TEXT } from '../lib/constants'

export default function Copyright() {
  return (
    <footer className="copyright" id="copyright-footer">
      <span className="body-sm text-muted">{COPYRIGHT_TEXT}</span>
    </footer>
  )
}
