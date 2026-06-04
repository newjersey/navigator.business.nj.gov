const SPRITE_PATH = "/assets/njwds/dist/img/sprite.svg";

interface IconProps {
  readonly iconName: string;
  readonly className?: string;
  readonly label?: string;
}

export const Icon = ({ iconName, className, label }: IconProps) => {
  return (
    <svg
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={`usa-icon ${className ?? ""}`}
      focusable="false"
      role={label ? "img" : undefined}
    >
      <use href={`${SPRITE_PATH}#${iconName}`} />
    </svg>
  );
};
