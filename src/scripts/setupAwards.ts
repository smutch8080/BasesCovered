import { setupTeamAwards } from '../services/awards/setup';
import { AwardCategory } from '../types';

async function init() {
  try {
    // Sample awards data for testing
    const sampleAwards = [
      {
        teamId: 'team1',
        playerId: 'player1',
        playerName: 'Sarah Smith',
        category: AwardCategory.EffortAndWorkEthic,
        type: 'Hustle Award',
        date: new Date()
      },
      {
        teamId: 'team1',
        playerId: 'player2',
        playerName: 'Emily Johnson',
        category: AwardCategory.SkillAndPerformance,
        type: 'Golden Glove Award',
        date: new Date()
      }
    ];

    console.log('Starting awards setup...');
    await setupTeamAwards(sampleAwards);
    
    // Give time for the batch operation to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Awards setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to setup awards:', error);
    process.exit(1);
  }
}

init();