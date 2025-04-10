import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Player, Team } from '../types/team';
import { MediaItem } from '../types/media';
import { ArrowLeft } from 'lucide-react';
import { PlayerHeader } from '../components/players/PlayerHeader';
import { PlayerStats } from '../components/players/PlayerStats';
import { PlayerProgressChart } from '../components/players/PlayerProgressChart';
import { PlayerAchievements } from '../components/players/PlayerAchievements';
import { PlayerHomework } from '../components/players/PlayerHomework';
import { MediaUpload } from '../components/profile/MediaUpload';
import { MediaGallery } from '../components/profile/MediaGallery';
import { fetchPlayerMedia } from '../services/media';
import { fetchPlayerAwards } from '../services/awards/player';
import toast from 'react-hot-toast';

function PlayerProfilePage() {
  const { teamId, playerId } = useParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [awards, setAwards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadPlayerData = async () => {
      if (!teamId || !playerId || !currentUser) return;

      try {
        setIsLoading(true);

        // Load team data
        const teamDoc = await getDoc(doc(db, 'teams', teamId));
        if (!teamDoc.exists()) {
          toast.error('Team not found');
          return;
        }

        const teamData = teamDoc.data() as Team;
        setTeam(teamData);

        // Find player in team
        const playerData = teamData.players?.find(p => p.id === playerId);
        if (!playerData) {
          toast.error('Player not found');
          return;
        }
        setPlayer(playerData);

        // Load player media
        const mediaData = await fetchPlayerMedia(playerId);
        setMedia(mediaData);

        // Load player awards
        const awardsData = await fetchPlayerAwards(playerId);
        setAwards(awardsData);

      } catch (error) {
        console.error('Error loading player data:', error);
        toast.error('Unable to load player data');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayerData();
  }, [teamId, playerId, currentUser]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  if (!player || !team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Player not found</p>
      </div>
    );
  }

  const canManageMedia = currentUser && (
    currentUser.id === playerId ||
    currentUser.role === 'admin' ||
    team.coachId === currentUser.id ||
    team.coaches?.includes(currentUser.id)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to={`/teams/${teamId}`}
          className="flex items-center gap-2 text-brand-primary hover:opacity-90"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Team
        </Link>
      </div>

      <div className="space-y-8">
        <PlayerHeader player={player} teamName={team.name} />
        <PlayerStats player={player} />
        
        {/* Media Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Media Gallery</h2>
          {canManageMedia && (
            <div className="mb-6">
              <MediaUpload
                playerId={playerId}
                media={media}
                onMediaChange={setMedia}
                maxImages={10}
                maxVideos={3}
              />
            </div>
          )}
          <MediaGallery media={media} />
        </div>

        {awards.length > 0 && (
          <PlayerAchievements awards={awards} />
        )}

        <PlayerHomework
          teamId={teamId}
          playerId={playerId}
          homework={[]}
          isCoach={currentUser?.role === 'coach' || currentUser?.role === 'admin'}
        />
      </div>
    </div>
  );
}

export default PlayerProfilePage;