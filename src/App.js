// ----------------------------------------------------------------------------------
// FILE: src/App.js
// --- UPDATED FILE ---
// Fixed the scroll-to-top issue on page navigation.
//made tag improments
// ----------------------------------------------------------------------------------

import React, { useState, useMemo, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams,
  useLocation,
} from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUp,
  Search,
  Menu,
  MessageCircle,
  Send,
  ShoppingBag,
  Info,
  Rss,
  Home,
  List,
  Star,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useFirestore, useFeaturedProduct } from './firebase';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

// Import Swiper React components and styles
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper modules
import { Navigation, Thumbs, FreeMode, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';

import {
  FacebookShareButton,
  TwitterShareButton,
  PinterestShareButton,
  FacebookIcon,
  TwitterIcon,
  PinterestIcon,
} from 'react-share';

// --- Helper Functions & Utility Components ---

const isValidHttpUrl = (string) => {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
};

const useMediaQuery = (query) => {
  const [matches, setMatches] = React.useState(
    window.matchMedia(query).matches
  );
  React.useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  return matches;
};

// *** NEW: ScrollToTop component that will be used in the main App layout ***
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const StatusBadge = ({ status, className }) => {
  const statusConfig = {
    Available: {
      text: 'Available',
      icon: <CheckCircle2 size={18} />,
      style: 'from-green-100 to-green-200 text-green-900',
    },
    'Made to Order': {
      text: 'Made to Order',
      icon: <Clock size={18} />,
      style: 'from-yellow-100 to-yellow-200 text-yellow-900',
    },
    'Out of Stock': {
      text: 'Out of Stock',
      icon: <XCircle size={18} />,
      style: 'from-pink-100 to-pink-200 text-pink-900',
    },
  };
  const config = statusConfig[status] || statusConfig['Out of Stock'];
  return (
    <motion.div
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm bg-gradient-to-br shadow-md ${config.style} ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 15,
        duration: 0.3,
      }}
    >
      {config.icon}
      <span>{config.text}</span>
    </motion.div>
  );
};

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          className='fixed bottom-6 right-6 z-50 p-3 rounded-full bg-purple-500 text-white shadow-lg hover:bg-purple-600 transition-colors'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          aria-label='Go to top'
        >
          <ArrowUp size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const Header = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  React.useEffect(() => {
    setIsOpen(false);
  }, [location]);
  const navLinks = [
    { name: 'Home', path: '/', icon: <Home /> },
    { name: 'Products', path: '/products', icon: <ShoppingBag /> },
    { name: 'Categories', path: '/categories', icon: <List /> },
    { name: 'Blog', path: '/blog', icon: <Rss /> },
    { name: 'About', path: '/about', icon: <Info /> },
    { name: 'Contact', path: '/contact', icon: <MessageCircle /> },
  ];
  return (
    <header className='sticky top-0 z-40 bg-white/80 backdrop-blur-lg shadow-sm'>
      <div className='container mx-auto px-4 flex justify-between items-center py-4'>
        <Link
          to='/'
          className='text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600'
        >
          Hmue's CraftHouse
        </Link>
        <nav className='hidden md:flex items-center gap-6'>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className='text-purple-800 font-semibold hover:text-pink-500 transition-colors'
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <div className='md:hidden'>
          <button onClick={() => setIsOpen(!isOpen)}>
            <Menu className='text-purple-800' />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='md:hidden overflow-hidden'
          >
            <nav className='flex flex-col items-center gap-4 py-4 border-t border-gray-200'>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className='flex items-center gap-3 text-purple-800 font-semibold hover:text-pink-500 transition-colors text-lg py-2'
                >
                  {link.icon} {link.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const Footer = () => (
  <footer className='bg-purple-100 text-purple-900 pt-12 pb-6 relative'>
    <div className='absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-400 to-purple-400'></div>
    <div className='container mx-auto px-4 grid md:grid-cols-3 gap-8 text-center md:text-left'>
      <div>
        <h3 className='font-bold text-lg mb-3'>Quick Links</h3>
        <ul>
          <li className='mb-1'>
            <Link to='/products' className='hover:text-pink-600'>
              Products
            </Link>
          </li>
          <li className='mb-1'>
            <Link to='/blog' className='hover:text-pink-600'>
              Blog
            </Link>
          </li>
          <li className='mb-1'>
            <Link to='/about' className='hover:text-pink-600'>
              About Me
            </Link>
          </li>
          <li className='mb-1'>
            <Link to='/contact' className='hover:text-pink-600'>
              Contact
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h3 className='font-bold text-lg mb-3'>Follow Along</h3>
        <div className='flex justify-center md:justify-start gap-4'>
          <a
            href='viber://chat?number=%2B9594280523337'
            className='hover:text-pink-600'
          >
            Viber
          </a>
          <a
            href='https://www.tiktok.com/@hmues.craft'
            className='hover:text-pink-600'
          >
            Tiktok
          </a>
          <a
            href='https://m.me/238273769371301?source=qr_link_share'
            className='hover:text-pink-600'
          >
            Messenger
          </a>
        </div>
      </div>
      <div>
        <h3 className='font-bold text-lg mb-3'>Hmue's CraftHouse</h3>
        <p>
          Handmade with love and yarn. Bringing cute and cozy creations to life.
        </p>
      </div>
    </div>
    <div className='text-center mt-10 border-t border-purple-200 pt-6'>
      <p>
        &copy; {new Date().getFullYear()} Hmue's CraftHouse. All Rights
        Reserved.
      </p>
    </div>
  </footer>
);

const ErrorMessage = ({ message }) => (
  <div className='text-center py-10 my-4 text-red-600 bg-red-100 p-4 rounded-lg'>
    <h3 className='font-bold text-xl mb-2'>😢 Oops! Something went wrong.</h3>
    <p className='text-sm'>{message}</p>
  </div>
);

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);
const ProductCardSkeleton = () => (
  <div className='bg-white rounded-2xl shadow-lg overflow-hidden h-full flex flex-col'>
    <Skeleton className='w-full h-40' />
    <div className='p-3 flex-grow flex flex-col'>
      <Skeleton className='h-5 w-3/4 mb-2' />
      <Skeleton className='h-4 w-full mb-3' />
      <div className='mt-auto'>
        <Skeleton className='h-8 w-full rounded-full' />
      </div>
    </div>
  </div>
);
const BlogCardSkeleton = () => (
  <div className='bg-white rounded-2xl shadow-lg overflow-hidden h-full'>
    <Skeleton className='w-full aspect-w-16 aspect-h-9 h-48' />
    <div className='p-6'>
      <Skeleton className='h-4 w-24 mb-3' />
      <Skeleton className='h-6 w-full mb-2' />
      <Skeleton className='h-6 w-3/4 mb-4' />
      <Skeleton className='h-5 w-28' />
    </div>
  </div>
);
const CategorySkeleton = () => (
  <div className='p-6 text-center bg-pink-50 rounded-2xl shadow-md h-full'>
    <Skeleton className='w-20 h-20 rounded-full mx-auto mb-3' />
    <Skeleton className='h-6 w-3/4 mx-auto' />
  </div>
);
const FeaturedProductSkeleton = () => (
  <div className='grid md:grid-cols-2 gap-8 items-center bg-gradient-to-br from-pink-50 to-purple-100 p-8 rounded-3xl'>
    <Skeleton className='w-full h-64 md:h-80 rounded-2xl' />
    <div className='flex flex-col items-center md:items-start text-center md:text-left'>
      <Skeleton className='h-5 w-32 mb-4' />
      <Skeleton className='h-10 w-4/5 mb-4' />
      <Skeleton className='h-5 w-full mb-2' />
      <Skeleton className='h-5 w-full mb-2' />
      <Skeleton className='h-5 w-2/3 mb-6' />
      <Skeleton className='h-12 w-40 rounded-full' />
    </div>
  </div>
);

const ProductMediaViewer = ({ product }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const renderMedia = (url, type, altText, isZoomable = false) => {
    const displayUrl = isValidHttpUrl(url)
      ? url
      : 'https://placehold.co/800x800/D8B4FE/FFFFFF?text=Invalid+URL';
    const imageElement = (
      <img
        src={displayUrl}
        alt={altText}
        className='w-full h-full object-contain'
      />
    );

    if (type === 'video') {
      return (
        <video
          src={displayUrl}
          controls
          className='w-full h-full object-contain'
          aria-label={altText}
        />
      );
    }

    if (isZoomable) {
      return <Zoom>{imageElement}</Zoom>;
    }

    return imageElement;
  };
  const hasMedia = product.mediaUrls && product.mediaUrls.length > 0;
  const hasMultipleMedia = hasMedia && product.mediaUrls.length > 1;
  return (
    <div className='w-full max-w-full overflow-hidden'>
      <style>{`.main-swiper .swiper-button-next, .main-swiper .swiper-button-prev { color: #a78bfa; background-color: rgba(255, 255, 255, 0.7); border-radius: 9999px; width: 36px; height: 36px; } .main-swiper .swiper-button-next::after, .main-swiper .swiper-button-prev::after { font-size: 1rem; font-weight: bold; } .thumbs-swiper .swiper-slide-thumb.swiper-slide-thumb-active { opacity: 1; border-color: #c084fc; }`}</style>
      <Swiper
        modules={[Navigation, Thumbs, FreeMode, Pagination]}
        thumbs={{
          swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
        }}
        spaceBetween={10}
        slidesPerView={1}
        navigation={hasMultipleMedia}
        pagination={hasMultipleMedia ? { clickable: true } : false}
        loop={hasMultipleMedia}
        initialSlide={0}
        autoHeight={true}
        className='main-swiper bg-gray-100 rounded-2xl w-full min-h-[300px] sm:min-h-[450px] md:min-h-[550px]'
        style={{ width: '100%' }}
      >
        {hasMedia ? (
          product.mediaUrls.map((url, index) => (
            <SwiperSlide
              key={index}
              className='flex items-center justify-center bg-white flex-shrink-0'
            >
              {renderMedia(
                url,
                product.mediaType,
                `${product.title} - view ${index + 1}`,
                true
              )}
            </SwiperSlide>
          ))
        ) : (
          <SwiperSlide className='flex items-center justify-center'>
            {renderMedia(null, 'image', 'No image available', true)}
          </SwiperSlide>
        )}
      </Swiper>
      {hasMultipleMedia && (
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={4}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
          className='thumbs-swiper mt-4 h-20 md:h-24'
        >
          {product.mediaUrls.map((url, index) => (
            <SwiperSlide
              key={index}
              className='cursor-pointer rounded-lg overflow-hidden border-2 border-transparent opacity-60 hover:opacity-100 transition-opacity swiper-slide-thumb'
            >
              <div className='w-full h-full bg-gray-200'>
                {renderMedia(
                  url,
                  product.mediaType,
                  `Thumbnail for ${product.title} - view ${index + 1}`
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};
const ProductCard = ({ product }) => {
  const imageUrl = product.mediaUrls?.[0];
  const displayUrl = isValidHttpUrl(imageUrl)
    ? imageUrl
    : 'https://placehold.co/600x400/F9A8D4/4A235A?text=Image';
  return (
    <Link to={`/products/${product.id}`} className='h-full'>
      <motion.div
        className='bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer h-full flex flex-col'
        whileHover={{ y: -5, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
        layoutId={`product-card-${product.id}`}
      >
        <div className='relative'>
          <div className='w-full overflow-hidden h-40 md:h-60'>
            <img
              src={displayUrl}
              alt={product.title}
              className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-110'
            />
          </div>
          <div className='absolute top-2 left-2 z-10 scale-[0.85] origin-top-left'>
            <StatusBadge status={product.status} />
          </div>
        </div>
        <div className='p-3 flex-grow flex flex-col'>
          <h3 className='text-purple-800 font-semibold text-base truncate mb-1'>
            {product.title}
          </h3>
          <p className='text-gray-500 text-sm line-clamp-2 mb-2 flex-grow'>
            {product.description}
          </p>
          <div className='mt-auto text-center'>
            <span className='inline-block px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white text-xs font-semibold rounded-full group-hover:from-pink-500 group-hover:to-purple-500 transition-all'>
              View Details
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
const RecentCreations = ({ products, loading }) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  if (loading) {
    if (isDesktop)
      return (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      );
    return (
      <div className='flex space-x-4 px-4 sm:px-0'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='w-2/3 sm:w-1/3 flex-shrink-0'>
            <ProductCardSkeleton />
          </div>
        ))}
      </div>
    );
  }
  if (isDesktop)
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  return (
    <Swiper
      spaceBetween={16}
      slidesPerView={1.7}
      className='!px-4 sm:!px-0'
      breakpoints={{ 768: { slidesPerView: 3, spaceBetween: 20 } }}
    >
      {products.map((product) => (
        <SwiperSlide key={product.id} className='h-auto'>
          <ProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
const BlogCard = ({ post }) => {
  const coverUrl = post.coverImageUrl;
  const displayCoverUrl = isValidHttpUrl(coverUrl)
    ? coverUrl
    : 'https://placehold.co/800x600/FFB6C1/4A235A?text=Blog';
  return (
    <Link to={`/blog/${post.id}`} className='h-full'>
      <motion.div
        className='bg-white rounded-2xl shadow-lg overflow-hidden group h-full flex flex-col'
        whileHover={{ y: -5, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
      >
        <div className='aspect-w-16 aspect-h-9'>
          <img
            src={displayCoverUrl}
            alt={post.title}
            className='w-full h-full object-cover'
          />
        </div>
        <div className='p-6 flex flex-col flex-grow'>
          <p className='text-sm text-gray-500 mb-2'>
            {post.createdAt?.toLocaleDateString()}
          </p>
          <h3 className='text-xl font-bold text-purple-800 mb-3 group-hover:text-pink-600 transition-colors flex-grow'>
            {post.title}
          </h3>
          <span className='font-semibold text-pink-500 mt-auto'>
            Read More &rarr;
          </span>
        </div>
      </motion.div>
    </Link>
  );
};

// --- Page Components ---

const HomePage = ({
  categories,
  products,
  blogPosts,
  catLoading,
  prodLoading,
  blogLoading,
  catError,
  prodError,
  blogError,
}) => {
  const {
    product: featuredProduct,
    loading: featuredLoading,
    error: featuredError,
  } = useFeaturedProduct();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <section className='relative min-h-[70vh] flex items-center justify-center text-center text-white overflow-hidden bg-gradient-to-br from-pink-200 via-purple-200 to-pink-100'>
        <div className='absolute inset-0 z-0 opacity-30'>
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className='absolute text-5xl md:text-7xl'
              initial={{
                x: `${Math.random() * 100}vw`,
                y: `${Math.random() * 100}vh`,
                rotate: Math.random() * 360,
              }}
              animate={{
                y: [
                  null,
                  Math.random() * 100 + 'vh',
                  Math.random() * 100 + 'vh',
                ],
                x: [
                  null,
                  Math.random() * 100 + 'vw',
                  Math.random() * 100 + 'vw',
                ],
                rotate: 360,
              }}
              transition={{
                duration: 20 + Math.random() * 20,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
              }}
            >
              🧶
            </motion.div>
          ))}
        </div>
        <div className='relative z-10 p-4 bg-black/10 backdrop-blur-sm rounded-2xl'>
          <h1 className='text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 drop-shadow-lg'>
            Handmade Crochet with Love
          </h1>
          <motion.div
            className='h-1 w-48 mx-auto mt-4 bg-gradient-to-r from-pink-500 to-purple-600'
            initial={{ width: 0 }}
            animate={{ width: '12rem' }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <p className='mt-4 text-lg md:text-xl text-purple-900 max-w-2xl mx-auto'>
            Discover cute & cozy crochet creations, made just for you.
          </p>
          <div className='mt-8 flex flex-col sm:flex-row gap-4 justify-center'>
            <Link to='/products'>
              <motion.button
                className='px-8 py-3 bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-bold rounded-full shadow-lg'
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0px 0px 15px rgba(255, 182, 193, 0.8)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Products
              </motion.button>
            </Link>
            <Link to='/blog'>
              <motion.button
                className='px-8 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-bold rounded-full shadow-lg'
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0px 0px 15px rgba(216, 180, 254, 0.8)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                Read Tutorials
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {featuredError && <ErrorMessage message={featuredError} />}
      {!featuredLoading && featuredProduct && (
        <section className='py-16 bg-white'>
          <div className='container mx-auto px-4'>
            <h2 className='text-3xl font-bold text-center text-purple-800 mb-10'>
              Featured Creation
            </h2>
            <div className='grid md:grid-cols-2 gap-8 items-center bg-gradient-to-br from-pink-50 to-purple-100 p-8 rounded-3xl shadow-lg'>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={
                    isValidHttpUrl(featuredProduct.mediaUrls?.[0])
                      ? featuredProduct.mediaUrls[0]
                      : 'https://placehold.co/800x600/F9A8D4/4A235A?text=Featured'
                  }
                  alt={featuredProduct.title}
                  className='w-full h-64 md:h-80 object-cover rounded-2xl shadow-md'
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className='flex flex-col items-center md:items-start text-center md:text-left'
              >
                <div className='flex items-center gap-2 text-pink-500 font-semibold mb-2'>
                  <Star size={20} />
                  <span>Featured Product</span>
                </div>
                <h3 className='text-3xl font-bold text-purple-900 mb-3'>
                  {featuredProduct.title}
                </h3>
                <p className='text-gray-600 line-clamp-3 mb-4'>
                  {featuredProduct.description}
                </p>
                <Link to={`/products/${featuredProduct.id}`}>
                  <motion.button
                    className='px-8 py-3 bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-bold rounded-full shadow-lg'
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Details
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      )}
      {featuredLoading && (
        <section className='py-16 bg-white'>
          <div className='container mx-auto px-4'>
            <FeaturedProductSkeleton />
          </div>
        </section>
      )}

      <section className='py-16 bg-purple-50'>
        <div className='container mx-auto px-4'>
          <h2 className='text-3xl font-bold text-center text-purple-800 mb-10'>
            Browse by Category
          </h2>
          {catLoading ? (
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
              {[...Array(4)].map((_, i) => (
                <CategorySkeleton key={i} />
              ))}
            </div>
          ) : catError ? (
            <ErrorMessage message={catError} />
          ) : (
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
              {categories.slice(0, 4).map((cat) => (
                // <Link to='/categories' key={cat.id}>
                <Link to={`/products?category=${cat.id}`} key={cat.id}>
                  <motion.div
                    className='p-6 text-center bg-pink-50 rounded-2xl shadow-md cursor-pointer h-full'
                    whileHover={{
                      y: -10,
                      boxShadow: '0px 10px 20px rgba(216, 180, 254, 0.5)',
                    }}
                  >
                    <div className='text-5xl mb-3'>{cat.iconUrl || '🎀'}</div>
                    <h3 className='font-bold text-purple-700'>{cat.name}</h3>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className='py-16 bg-white overflow-hidden'>
        <div className='container mx-auto'>
          <h2 className='text-3xl font-bold text-center text-purple-800 mb-10 px-4'>
            Recent Creations
          </h2>
          {prodError ? (
            <ErrorMessage message={prodError} />
          ) : (
            <RecentCreations
              products={products.slice(0, 8)}
              loading={prodLoading}
            />
          )}
        </div>
      </section>
      <section className='py-16 bg-purple-50'>
        <div className='container mx-auto px-4'>
          <h2 className='text-3xl font-bold text-center text-purple-800 mb-10'>
            Latest from the Blog
          </h2>
          {blogLoading ? (
            <div className='grid md:grid-cols-3 gap-8'>
              {[...Array(3)].map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : blogError ? (
            <ErrorMessage message={blogError} />
          ) : (
            <div className='grid md:grid-cols-3 gap-8'>
              {blogPosts.slice(0, 3).map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
};

const AllProductsPage = ({
  categories,
  allProducts,
  allProductsLoading,
  allProductsError,
}) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [availabilityFilter, setAvailabilityFilter] = useState(null);
  const [tagFilter, setTagFilter] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryId = params.get('category');
    if (categoryId) {
      setCategoryFilter(categoryId);
    }
  }, [location.search]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter(null);
    setAvailabilityFilter(null);
    setTagFilter([]);
    setSortOrder('newest');
  };

  const sortedAndFilteredProducts = useMemo(() => {
    let tempProducts = [...allProducts];
    tempProducts = tempProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (!categoryFilter || p.categoryIds.includes(categoryFilter)) &&
        (!availabilityFilter || p.status === availabilityFilter) &&
        (tagFilter.length === 0 ||
          tagFilter.every((tag) => p.tags.includes(tag)))
    );
    switch (sortOrder) {
      case 'oldest':
        tempProducts.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        break;
      case 'alphabetical':
        tempProducts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        tempProducts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        break;
    }
    return tempProducts;
  }, [
    allProducts,
    searchTerm,
    categoryFilter,
    availabilityFilter,
    tagFilter,
    sortOrder,
  ]);

  const allTags = useMemo(
    () => [...new Set(allProducts.flatMap((p) => p.tags || []))],
    [allProducts]
  );
  const toggleTag = (tag) =>
    setTagFilter((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  return (
    <div className='container mx-auto px-4 py-8'>
      <motion.h1
        className='text-4xl font-extrabold text-center mb-2 text-purple-800'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        All Crochet Creations
      </motion.h1>
      <motion.div
        className='h-1 w-32 mx-auto bg-gradient-to-r from-pink-500 to-purple-500'
        initial={{ width: 0 }}
        animate={{ width: '8rem' }}
        transition={{ duration: 0.7 }}
      />
      <div className='my-8 p-4 bg-white/50 backdrop-blur-md rounded-2xl shadow-sm'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
          <div className='relative md:col-span-2'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Search for creations...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400'
            />
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className='w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400'
          >
            <option value='newest'>Sort by: Newest</option>
            <option value='oldest'>Sort by: Oldest</option>
            <option value='alphabetical'>Sort by: A-Z</option>
          </select>
        </div>
        <div className='mb-4'>
          <h3 className='font-semibold mb-2 text-purple-700'>Categories</h3>
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() => setCategoryFilter(null)}
              className={`px-4 py-1 rounded-full text-sm transition-colors ${
                !categoryFilter
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-purple-200'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-4 py-1 rounded-full text-sm transition-colors ${
                  categoryFilter === cat.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-purple-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        <div className='mb-4'>
          <h3 className='font-semibold mb-2 text-purple-700'>Availability</h3>
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() => setAvailabilityFilter(null)}
              className={`px-4 py-1 rounded-full text-sm transition-colors ${
                !availabilityFilter
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-yellow-200'
              }`}
            >
              All
            </button>
            {['Available', 'Made to Order', 'Out of Stock'].map((status) => (
              <button
                key={status}
                onClick={() => setAvailabilityFilter(status)}
                className={`px-4 py-1 rounded-full text-sm transition-colors ${
                  availabilityFilter === status
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-yellow-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className='font-semibold mb-2 text-purple-700'>Tags</h3>
          <div className='flex flex-wrap gap-2'>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 text-xs rounded-full font-semibold transition-colors ${
                  tagFilter.includes(tag)
                    ? 'bg-pink-500 text-white'
                    : 'bg-pink-200/60 text-purple-800 hover:bg-pink-300/80'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className='mt-4 pt-4 border-t border-gray-200 text-right'>
          <button
            onClick={handleClearFilters}
            className='px-4 py-2 text-sm font-semibold text-purple-700 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors'
          >
            Clear All Filters
          </button>
        </div>
      </div>
      {allProductsError && <ErrorMessage message={allProductsError} />}
      <AnimatePresence>
        <motion.div
          className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {allProductsLoading
            ? [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)
            : sortedAndFilteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
        </motion.div>
      </AnimatePresence>
      {!allProductsLoading && sortedAndFilteredProducts.length === 0 && (
        <div className='text-center py-16 text-gray-500'>
          <p className='text-xl'>No creations found!</p>
          <p>Try adjusting your filters.</p>
        </div>
      )}
      <BackToTopButton />
    </div>
  );
};

const AllCategoriesPage = ({ categories, loading, error }) => {
  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-4xl font-extrabold text-center mb-8 text-purple-800'>
        Browse by Category
      </h1>
      {loading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
          {[...Array(3)].map((_, i) => (
            <CategorySkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
          {categories.map((cat) => (
            //<Link to='/products' key={cat.id}>
            <Link to={`/products?category=${cat.id}`} key={cat.id}>
              <motion.div
                className='p-8 bg-white rounded-3xl shadow-lg flex flex-col items-center text-center h-full'
                whileHover={{
                  y: -10,
                  scale: 1.03,
                  boxShadow: '0px 15px 30px rgba(216, 180, 254, 0.6)',
                }}
                style={{ perspective: 1000 }}
              >
                <motion.div
                  className='w-24 h-24 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center text-5xl mb-4'
                  whileHover={{ rotateY: 20, rotateX: -10 }}
                >
                  {cat.iconUrl || '🎀'}
                </motion.div>
                <h2 className='text-2xl font-bold text-purple-700 mb-2'>
                  {cat.name}
                </h2>
                <p className='text-gray-600'>{cat.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductDetailPage = ({
  categories,
  allProducts,
  allProductsLoading,
  allProductsError,
}) => {
  const { id } = useParams();
  const product = allProducts.find((p) => p.id === id);

  if (allProductsLoading)
    return (
      <div className='container mx-auto px-4 pt-8'>
        <Skeleton className='h-[300px] sm:h-[450px] md:h-[550px] w-full rounded-2xl' />
      </div>
    );
  if (allProductsError) return <ErrorMessage message={allProductsError} />;
  if (!product && !allProductsLoading)
    return <div className='text-center py-16'>Product not found!</div>;

  const relatedProducts = allProducts
    .filter(
      (p) =>
        p.categoryIds?.some((catId) => product.categoryIds?.includes(catId)) &&
        p.id !== product.id
    )
    .slice(0, 5);

  return (
    <div className='container mx-auto px-4 pt-8 pb-32 md:pb-8'>
      {product && (
        <>
          <div className='grid md:grid-cols-2 gap-8 md:gap-12'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className='overflow-hidden w-full flex justify-center'
            >
              <ProductMediaViewer product={product} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className='text-3xl md:text-4xl font-extrabold text-purple-900 mb-4'>
                {product.title}
              </h1>
              <div className='mb-6'>
                <StatusBadge status={product.status} />
              </div>
              <p className='text-gray-600 mb-6 leading-relaxed'>
                {product.description}
              </p>
              <div className='mb-6'>
                <h3 className='font-semibold text-purple-800 mb-2'>Tags</h3>
                <div className='flex flex-wrap gap-2'>
                  {product.tags?.map((tag) => (
                    <span
                      key={tag}
                      className='px-3 py-1.5 text-xs rounded-full font-semibold text-purple-800 bg-pink-200/60 shadow-sm hover:bg-pink-300/80 hover:text-purple-900 transition-colors'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className='mb-8'>
                <h3 className='font-semibold text-purple-800 mb-2'>
                  Categories
                </h3>
                <div className='flex flex-wrap gap-2'>
                  {product.categoryIds?.map((catId) => {
                    const category = categories.find((c) => c.id === catId);
                    return category ? (
                      <Link
                        key={catId}
                        to='/products'
                        className='bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm hover:bg-purple-200 transition'
                      >
                        {category.name}
                      </Link>
                    ) : null;
                  })}
                </div>
              </div>
              <div className='hidden md:block'>
                <h3 className='font-semibold text-purple-800 mb-3 text-center'>
                  Interested? Contact me!
                </h3>
                <div className='flex flex-col sm:flex-row gap-4'>
                  <motion.a
                    href='viber://chat?number=%2B959428052227'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex-1 text-center px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-full shadow-lg flex items-center justify-center gap-2'
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MessageCircle /> Order via Viber
                  </motion.a>
                  <motion.a
                    href='https://m.me/238273769371301?source=qr_link_share'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex-1 text-center px-6 py-3 bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-bold rounded-full shadow-lg flex items-center justify-center gap-2'
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send /> Order via Messenger
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
          {relatedProducts.length > 0 && (
            <div className='mt-16'>
              <h2 className='text-3xl font-bold text-purple-800 mb-6'>
                You Might Also Like
              </h2>
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6'>
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
          <div className='md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg p-4 border-t border-gray-200 shadow-lg-top z-50'>
            <div className='flex gap-4'>
              <motion.a
                href='viber://chat?number=%2B959793664676'
                target='_blank'
                rel='noopener noreferrer'
                className='flex-1 text-center py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-full shadow-lg flex items-center justify-center gap-2'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle size={18} /> Viber
              </motion.a>
              <motion.a
                href='https://t.me/serioton24'
                target='_blank'
                rel='noopener noreferrer'
                className='flex-1 text-center py-3 bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-bold rounded-full shadow-lg flex items-center justify-center gap-2'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send size={18} /> Telegram
              </motion.a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const BlogListPage = ({ blogPosts, loading, error }) => {
  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-4xl font-extrabold text-center mb-8 text-purple-800'>
        Crochet Tutorials & Inspiration
      </h1>
      {loading ? (
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {[...Array(6)].map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {blogPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
      <BackToTopButton />
    </div>
  );
};

const BlogDetailPage = ({ blogPosts, loading, error }) => {
  const { id } = useParams();
  const post = blogPosts.find((p) => p.id === id);
  if (loading)
    return (
      <div className='container mx-auto px-4 pt-8'>
        <Skeleton className='h-[50vh] w-full' />
        <div className='max-w-4xl mx-auto mt-8'>
          <Skeleton className='h-12 w-3/4 mb-4' />
          <Skeleton className='h-6 w-1/4 mb-8' />
          <Skeleton className='h-6 w-full mb-4' />
          <Skeleton className='h-6 w-full mb-4' />
          <Skeleton className='h-6 w-5/6 mb-4' />
        </div>
      </div>
    );
  if (error) return <ErrorMessage message={error} />;
  if (!post)
    return <div className='text-center py-16'>Blog post not found!</div>;
  const relatedPosts = blogPosts.filter((p) => p.id !== id).slice(0, 2);
  const shareUrl = window.location.href;
  const coverImageUrl = isValidHttpUrl(post.coverImageUrl)
    ? post.coverImageUrl
    : '';
  return (
    <div className='bg-white'>
      <div className='w-full h-[50vh] overflow-hidden'>
        <img
          src={
            coverImageUrl ||
            'https://placehold.co/1200x600/D8B4FE/FFFFFF?text=Blog+Post'
          }
          alt={post.title}
          className='w-full h-full object-cover'
        />
      </div>
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className='text-3xl md:text-5xl font-extrabold text-purple-900 mb-3'>
            {post.title}
          </h1>
          <p className='text-gray-500 mb-8'>
            {post.createdAt?.toLocaleDateString()}
          </p>
          <article className='prose lg:prose-xl max-w-none prose-headings:text-purple-800 prose-a:text-pink-600 prose-strong:text-purple-800 prose-blockquote:border-l-pink-400 prose-blockquote:bg-purple-50/50 prose-blockquote:p-4 prose-blockquote:rounded-r-lg'>
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </article>
          <div className='mt-12 pt-8 border-t border-purple-200'>
            <h3 className='text-xl font-bold text-center text-purple-800 mb-4'>
              Share this post!
            </h3>
            <div className='flex justify-center items-center gap-4'>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <FacebookShareButton url={shareUrl} quote={post.title}>
                  <FacebookIcon size={40} round />
                </FacebookShareButton>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <TwitterShareButton url={shareUrl} title={post.title}>
                  <TwitterIcon size={40} round />
                </TwitterShareButton>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <PinterestShareButton
                  url={shareUrl}
                  media={coverImageUrl}
                  description={post.title}
                >
                  <PinterestIcon size={40} round />
                </PinterestShareButton>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
      {relatedPosts.length > 0 && (
        <div className='bg-purple-50 py-16'>
          <div className='container mx-auto px-4'>
            <h2 className='text-3xl font-bold text-purple-800 mb-6 text-center'>
              Keep Reading
            </h2>
            <div className='grid md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
              {relatedPosts.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </div>
      )}
      <BackToTopButton />
    </div>
  );
};

const AboutPage = () => (
  <div className='container mx-auto px-4 py-12'>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.2 }}
    >
      <h1 className='text-4xl font-extrabold text-center mb-8 text-purple-800'>
        About Me
      </h1>
      <div className='grid md:grid-cols-2 gap-12 items-center'>
        <motion.div
          className='text-center text-8xl'
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <span className='inline-block p-8 bg-pink-100 rounded-full'>🧶</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className='text-3xl font-bold text-purple-700 mb-4'>
            Hi, I'm Hmue!
          </h2>
          <p className='text-lg text-gray-600 leading-relaxed'>
            Welcome to my little corner of the internet! I started crocheting as
            a hobby, and it quickly turned into a passion. There's something
            magical about turning a simple ball of yarn into a cute, cuddly
            friend or a cozy piece to wear.
          </p>
          <p className='text-lg text-gray-600 leading-relaxed mt-4'>
            Every item you see here is handmade by me with lots of love and
            attention to detail. My goal is to share the joy and coziness that
            crochet brings into my life with all of you. Thank you for stopping
            by!
          </p>
        </motion.div>
      </div>
      <div className='mt-20'>
        <h2 className='text-3xl font-bold text-center text-purple-800 mb-12'>
          My Crochet Journey
        </h2>
        <div className='relative'>
          <div className='absolute left-1/2 top-0 h-full w-0.5 bg-gradient-to-b from-pink-300 to-purple-300 -translate-x-1/2'></div>
          <div className='relative flex items-center justify-between w-full mb-8'>
            <div className='w-5/12'></div>
            <div className='z-10 bg-pink-400 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl'>
              ✨
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className='w-5/12 bg-white p-4 rounded-lg shadow-md'
            >
              <h3 className='font-bold text-purple-700'>2019 - First Stitch</h3>
              <p className='text-sm text-gray-600'>
                Learned how to make a slip knot and my first chain.
              </p>
            </motion.div>
          </div>
          <div className='relative flex items-center justify-between w-full mb-8'>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className='w-5/12 bg-white p-4 rounded-lg shadow-md text-right'
            >
              <h3 className='font-bold text-purple-700'>
                2023 - First Amigurumi
              </h3>
              <p className='text-sm text-gray-600'>
                Successfully created my first plushie: a wobbly but cute
                octopus!
              </p>
            </motion.div>
            <div className='z-10 bg-purple-400 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl'>
              🐙
            </div>
            <div className='w-5/12'></div>
          </div>
          <div className='relative flex items-center justify-between w-full'>
            <div className='w-5/12'></div>
            <div className='z-10 bg-pink-400 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl'>
              💖
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className='w-5/12 bg-white p-4 rounded-lg shadow-md'
            >
              <h3 className='font-bold text-purple-700'>
                2024 - Opening This Shop
              </h3>
              <p className='text-sm text-gray-600'>
                Decided to share my creations with the world. Thanks for being
                here!
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);
const ContactPage = () => (
  <div className='container mx-auto px-4 py-12'>
    <h1 className='text-4xl font-extrabold text-center mb-8 text-purple-800'>
      Get In Touch
    </h1>
    <p className='text-center text-lg text-gray-600 max-w-2xl mx-auto mb-12'>
      Got questions or custom requests? 💌 Message me anytime on{' '}
      <strong>Viber</strong>, <strong>TikTok</strong>, or{' '}
      <strong>Messenger</strong>. Follow{' '}
      <a
        href='https://www.facebook.com/share/16wQE7ET8U/'
        target='_blank'
        rel='noopener noreferrer'
        className='text-purple-600 font-bold hover:underline'
      >
        @Hmue’s Craft House
      </a>{' '}
      on Facebook for updates & inspiration.
    </p>
    <div className='max-w-md mx-auto'>
      <div className='flex flex-col gap-6'>
        <motion.a
          href='viber://chat?number=%2B959428052227'
          target='_blank'
          rel='noopener noreferrer'
          className='flex-1 text-center p-6 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-4 text-xl'
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle size={32} />
          <span>Chat on Viber</span>
        </motion.a>
        <motion.a
          href='https://www.tiktok.com/@hmues.craft'
          target='_blank'
          rel='noopener noreferrer'
          className='flex-1 text-center p-6 bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-4 text-xl'
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Send size={32} />
          <span>Message on Tiktok</span>
        </motion.a>
        <motion.a
          href='https://m.me/238273769371301?source=qr_link_share'
          target='_blank'
          rel='noopener noreferrer'
          className='flex-1 text-center p-6 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-4 text-xl'
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle size={32} />
          <span>Chat on Messenger</span>
        </motion.a>
      </div>
      <div className='mt-12 p-6 bg-white rounded-2xl shadow-md'>
        <h3 className='text-2xl font-bold text-purple-700 mb-4 text-center'>
          This Feature is Coming Soon!
        </h3>
        <form>
          <div className='mb-4'>
            <label
              htmlFor='name'
              className='block text-purple-800 font-semibold mb-2'
            >
              Name
            </label>
            <input
              type='text'
              id='name'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400'
            />
          </div>
          <div className='mb-4'>
            <label
              htmlFor='email'
              className='block text-purple-800 font-semibold mb-2'
            >
              Email (Optional)
            </label>
            <input
              type='email'
              id='email'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400'
            />
          </div>
          <div className='mb-4'>
            <label
              htmlFor='message'
              className='block text-purple-800 font-semibold mb-2'
            >
              Message
            </label>
            <textarea
              id='message'
              rows='5'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400'
            ></textarea>
          </div>
          <motion.button
            type='submit'
            className='w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-lg shadow-md'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Contact me via Viber, Tiktok, or Messenger!
          </motion.button>
        </form>
      </div>
    </div>
  </div>
);
// --- MAIN APP COMPONENT ---

function AppContent() {
  const {
    docs: categories,
    loading: catLoading,
    error: catError,
  } = useFirestore('categories', {
    orderByField: 'order',
    orderByDirection: 'asc',
  });
  const {
    docs: blogPosts,
    loading: blogLoading,
    error: blogError,
  } = useFirestore('blogPosts', {
    orderByField: 'createdAt',
    orderByDirection: 'desc',
  });
  const {
    docs: allProducts,
    loading: allProductsLoading,
    error: allProductsError,
  } = useFirestore('products', {
    orderByField: 'createdAt',
    orderByDirection: 'desc',
  });

  const location = useLocation();
  const showBackToTop =
    ['/products', '/blog'].includes(location.pathname) ||
    location.pathname.startsWith('/blog/');

  return (
    <div className='flex flex-col min-h-screen bg-purple-50 font-sans'>
      <Header />
      <main className='flex-grow'>
        <AnimatePresence mode='wait'>
          <Routes>
            <Route
              path='/'
              element={
                <HomePage
                  categories={categories}
                  products={allProducts}
                  blogPosts={blogPosts}
                  catLoading={catLoading}
                  prodLoading={allProductsLoading}
                  blogLoading={blogLoading}
                  catError={catError}
                  prodError={allProductsError}
                  blogError={blogError}
                />
              }
            />
            <Route
              path='/products'
              element={
                <AllProductsPage
                  categories={categories}
                  allProducts={allProducts}
                  allProductsLoading={allProductsLoading}
                  allProductsError={allProductsError}
                />
              }
            />
            <Route
              path='/products/:id'
              element={
                <ProductDetailPage
                  categories={categories}
                  allProducts={allProducts}
                  allProductsLoading={allProductsLoading}
                  allProductsError={allProductsError}
                />
              }
            />
            <Route
              path='/categories'
              element={
                <AllCategoriesPage
                  categories={categories}
                  loading={catLoading}
                  error={catError}
                />
              }
            />
            <Route
              path='/blog'
              element={
                <BlogListPage
                  blogPosts={blogPosts}
                  loading={blogLoading}
                  error={blogError}
                />
              }
            />
            <Route
              path='/blog/:id'
              element={
                <BlogDetailPage
                  blogPosts={blogPosts}
                  loading={blogLoading}
                  error={blogError}
                />
              }
            />
            <Route path='/about' element={<AboutPage />} />
            <Route path='/contact' element={<ContactPage />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      {showBackToTop && <BackToTopButton />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}
