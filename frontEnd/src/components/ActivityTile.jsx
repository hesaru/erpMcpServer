import { useNavigate } from 'react-router-dom'
import './ActivityTile.css'

const ActivityTile = ({ title, description, icon, gradient, path }) => {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(path)
    }

    return (
        <div className="activity-tile" onClick={handleClick}>
            <div className="tile-gradient" style={{ background: gradient }}></div>
            <div className="tile-content">
                <div className="tile-icon">{icon}</div>
                <h3 className="tile-title">{title}</h3>
                <p className="tile-description">{description}</p>
                <div className="tile-arrow">→</div>
            </div>
        </div>
    )
}

export default ActivityTile
