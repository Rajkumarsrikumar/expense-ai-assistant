import { useNavigate } from 'react-router-dom';
import type { Team } from '../types';
import styles from './TeamSelection.module.css';

interface TeamSelectionProps {
  teams: Team[];
  onSelectTeam: (team: Team) => void;
}

export default function TeamSelection({ teams, onSelectTeam }: TeamSelectionProps) {
  const navigate = useNavigate();

  const handleSelect = (team: Team) => {
    onSelectTeam(team);
    navigate('/home');
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <span className={styles.logo} aria-hidden>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2L18 14H30L20 22L24 30L16 26L8 30L12 22L2 14H14L16 2Z" fill="#C00"/>
            </svg>
          </span>
          <h1 className={styles.title}>ST Engineering</h1>
        </header>
        <main className={styles.grid}>
          {teams.map((team, index) => (
            <button
              key={team.id}
              type="button"
              className={index === 3 ? `${styles.card} ${styles.cardCentered}` : styles.card}
              onClick={() => handleSelect(team)}
            >
            <div className={styles.avatar}>
              {team.imageUrl ? (
                <img src={team.imageUrl} alt="" />
              ) : (
                <span className={styles.avatarPlaceholder}>
                  {team.teamName.charAt(0)}
                </span>
              )}
            </div>
            <span className={styles.teamName}>{team.teamName}</span>
          </button>
            ))}
        </main>
      </div>
    </div>
  );
}
