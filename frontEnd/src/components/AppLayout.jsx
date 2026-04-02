import Navbar from './Navbar'

const AppLayout = ({ children }) => {
    return (
        <>
            <Navbar />
            {children}
        </>
    )
}

export default AppLayout
