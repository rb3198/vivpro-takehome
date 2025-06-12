import { Theme } from "../../theme";

export interface ThemedProps {
  theme?: Theme;
  toggleTheme?: () => void;
}
