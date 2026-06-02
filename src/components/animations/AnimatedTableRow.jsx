import { motion } from "framer-motion";

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

const AnimatedTableRow = ({ children, className = "", ...props }) => {
  return (
    <motion.tr
      variants={rowVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.tr>
  );
};

export default AnimatedTableRow;
