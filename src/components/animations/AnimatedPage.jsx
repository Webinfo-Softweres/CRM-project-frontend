import { motion } from "framer-motion";

const pageVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const AnimatedPage = ({ children, className = "" }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;
