import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { HelpArticle, HelpSection } from '../../types/help';

export async function fetchHelpArticles(section?: HelpSection): Promise<HelpArticle[]> {
  try {
    const articlesRef = collection(db, 'help_articles');
    const q = section 
      ? query(
          articlesRef,
          where('section', '==', section),
          orderBy('order', 'asc')
        )
      : query(articlesRef, orderBy('section'), orderBy('order', 'asc'));
    
    const querySnapshot = await getDocs(q);
    const articles: HelpArticle[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      articles.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as HelpArticle);
    });

    return articles;
  } catch (error) {
    console.error('Error fetching help articles:', error);
    throw error;
  }
}

export function getHelpLink(section: HelpSection, articleId?: string): string {
  return articleId 
    ? `/help/${section}/${articleId}`
    : `/help/${section}`;
}