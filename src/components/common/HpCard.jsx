import PropTypes from "prop-types";

const HpCard = ({ title, children, className = "", headerActions }) => {
    return (
        <div className={`bg-white rounded-xl border border-gray-200 shadow-xs p-5 ${className}`}>
            {title && (
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
                    {headerActions}
                </div>
            )}
            {children}
        </div>
    );
};

HpCard.propTypes = {
    title: PropTypes.node,
    children: PropTypes.node,
    className: PropTypes.string,
    headerActions: PropTypes.node
};

export default HpCard;
