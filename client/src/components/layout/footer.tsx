import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-neutral-darkest text-white pt-12 pb-6">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <h3 className="text-xl font-bold mb-4 font-heading">ShopWorld</h3>
            <p className="text-neutral-light mb-6">
              Your one-stop destination for all your shopping needs. Quality products, great prices, and excellent service.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-light hover:text-white transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-neutral-light hover:text-white transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-neutral-light hover:text-white transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-neutral-light hover:text-white transition-colors">
                <i className="fab fa-pinterest"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-neutral-light hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?new=true" className="text-neutral-light hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products?featured=true" className="text-neutral-light hover:text-white transition-colors">
                  Featured
                </Link>
              </li>
              <li>
                <Link href="/products?deals=true" className="text-neutral-light hover:text-white transition-colors">
                  Deals & Offers
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-neutral-light hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-neutral-light hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-neutral-light hover:text-white transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-neutral-light hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">My Account</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-neutral-light hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="#" className="text-neutral-light hover:text-white transition-colors" onClick={(e) => {
                  e.preventDefault();
                  document.dispatchEvent(new CustomEvent('open-cart'));
                }}>
                  View Cart
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-neutral-light hover:text-white transition-colors">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-neutral-light hover:text-white transition-colors">
                  Track My Order
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-dark mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-light text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} ShopWorld. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link href="/privacy" className="text-neutral-light hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-neutral-light hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-neutral-light hover:text-white text-sm transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
