import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import './ActivityTile.css'

const ActivityTile = ({ title, description, icon, gradient, path, image }) => {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(path)
    }

    return (
        <div className="activity-tile" onClick={handleClick}>
            <div className="tile-gradient" style={{ background: gradient }}></div>
            
            {/* Image Section */}
            {image && (
                <div className="tile-image-wrapper">
                    <img src={image} alt={title} className="tile-image" />
                    <div className="tile-image-overlay"></div>
                </div>
            )}

            <div className="tile-content">
                <div className="tile-icon">{icon}</div>
                <h3 className="tile-title">{title}</h3>
                <p className="tile-description">{description}</p>
                <div className="tile-footer">
                    <span className="tile-cta">Get Started</span>
                    <div className="tile-arrow">
                        <ArrowRight size={16} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ActivityTile
