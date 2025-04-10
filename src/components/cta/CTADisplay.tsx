// src/components/cta/CTADisplay.tsx
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CTAContent } from '../../types/cta';
import { useAuth } from '../../contexts/AuthContext';
import { CTATemplates } from './CTATemplates';

interface Props {
  locationId: string;
  className?: string;
}

export const CTADisplay: React.FC<Props> = ({ locationId, className = '' }) => {
  const [content, setContent] = useState<CTAContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadCTAContent = async () => {
      if (!currentUser) {
        console.log('CTADisplay: No current user, skipping load', {
          locationId,
          timestamp: new Date().toISOString()
        });
        return;
      }

      try {
        console.log('CTADisplay: Starting content load', {
          locationId,
          userId: currentUser.id,
          userRole: currentUser.role,
          timestamp: new Date().toISOString()
        });

        setIsLoading(true);
        const now = Timestamp.now();

        // First get location details
        const locationsRef = collection(db, 'cta_locations');
        const locationQuery = query(locationsRef, where('placement', '==', locationId));
        
        console.log('CTADisplay: Querying location', {
          locationId,
          query: {
            collection: 'cta_locations',
            placement: locationId
          }
        });
        
        const locationSnapshot = await getDocs(locationQuery);
        
        console.log('CTADisplay: Location query result', {
          found: !locationSnapshot.empty,
          count: locationSnapshot.size,
          locationId
        });

        if (locationSnapshot.empty) {
          console.log('CTADisplay: No location found', { locationId });
          return;
        }

        const locationData = locationSnapshot.docs[0].data();
        console.log('CTADisplay: Found location', {
          locationId: locationSnapshot.docs[0].id,
          name: locationData.name,
          placement: locationData.placement
        });

        // Then get content for location
        const contentRef = collection(db, 'cta_content');
        const contentQuery = query(
          contentRef,
          where('locationId', '==', locationSnapshot.docs[0].id),
          where('active', '==', true),
          where('roles', 'array-contains', currentUser.role),
          where('startDate', '<=', now),
          where('endDate', '>=', now),
          orderBy('startDate', 'desc'),
          orderBy('priority', 'desc')
        );

        console.log('CTADisplay: Querying content', {
          locationId: locationSnapshot.docs[0].id,
          query: {
            collection: 'cta_content',
            filters: {
              locationId: locationSnapshot.docs[0].id,
              active: true,
              role: currentUser.role,
              timestamp: now.toDate().toISOString()
            }
          }
        });

        const contentSnapshot = await getDocs(contentQuery);
        
        console.log('CTADisplay: Content query result', {
          found: !contentSnapshot.empty,
          count: contentSnapshot.size
        });

        if (!contentSnapshot.empty) {
          const data = contentSnapshot.docs[0].data();
          console.log('CTADisplay: Found content', {
            contentId: contentSnapshot.docs[0].id,
            title: data.title,
            roles: data.roles,
            active: data.active,
            priority: data.priority,
            startDate: data.startDate?.toDate()?.toISOString(),
            endDate: data.endDate?.toDate()?.toISOString()
          });

          setContent({
            ...data,
            id: contentSnapshot.docs[0].id,
            startDate: data.startDate?.toDate(),
            endDate: data.endDate?.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as CTAContent);
        } else {
          console.log('CTADisplay: No matching content found', {
            locationId: locationSnapshot.docs[0].id,
            userRole: currentUser.role,
            timestamp: now.toDate().toISOString()
          });
        }
      } catch (error) {
        console.error('CTADisplay: Error loading content', {
          error,
          code: error.code,
          message: error.message,
          stack: error.stack,
          locationId,
          userId: currentUser?.id,
          userRole: currentUser?.role
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCTAContent();
  }, [locationId, currentUser]);

  if (isLoading || !content) return null;

  return <CTATemplates content={content} className={className} />;
};
