const Footer = () => {
    return (
        <footer className="bg-blue-800 py-6 shadow-md">
            <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-12 flex justify-between items-center">
                <span className="text-2xl text-white font-bold tracking-tight">Booking.com</span> 
                <div className="text-white font-medium flex gap-4">
                    <p className="cursor-pointer hover:underline">Privacy Policy</p>
                    <p className="cursor-pointer hover:underline">Terms of Service</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
