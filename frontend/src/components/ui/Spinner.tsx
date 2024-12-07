import clsx from "clsx";

const Spinner = ({ className }: { className: string }) => {
  return (
    <div
      className={clsx(
        "border border-b-transparent border-l-range-button-active rounded-full animate-rotate ",
        className
      )}
    />
  );
};

export default Spinner;
