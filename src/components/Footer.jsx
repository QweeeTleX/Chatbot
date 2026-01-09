import "../styles/footer.css";

export default function Footer() {
	return (
		<footer className="app-footer">
			<span className="footer-text">
				Тестовый проект по чат-боту SUPER, {new Date().getFullYear()}
			</span>

			<div className="footer-links">
				<a href="#" className="footer-link">Условия использования</a>
				<a href="#" className="footer-link">Политика конфиденциальности</a>
			</div>
		</footer>
	);
}