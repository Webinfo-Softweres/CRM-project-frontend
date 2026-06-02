import { motion } from "framer-motion";

const tableVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const AnimatedTableBody = ({ children, className = "", ...props }) => {
  return (
    <motion.tbody
      variants={tableVariants}
      initial="hidden"
      animate="show"
      className={className}
      {...props}
    >
      {children}
    </motion.tbody>
  );
};

export default AnimatedTableBody;
