type Props = React.SVGAttributes<SVGElement>;

export function Reply(props: Props) {
  return (
    <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 19V15C19 14.1667 18.7083 13.4583 18.125 12.875C17.5417 12.2917 16.8333 12 16 12H6.8L10.4 15.6L9 17L3 11L9 5L10.4 6.4L6.8 10H16C17.3833 10 18.5627 10.4873 19.538 11.462C20.5127 12.4373 21 13.6167 21 15V19H19Z" />
    </svg>
  );
}
