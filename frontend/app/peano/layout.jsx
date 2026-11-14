import { PeanoWorkspaceProvider } from '../../src/features/peano/components/PeanoPage.jsx';

export default function PeanoLayout({ children }) {
  return <PeanoWorkspaceProvider>{children}</PeanoWorkspaceProvider>;
}
