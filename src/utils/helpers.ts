import { RawProduct, RawInstructor, Course, Instructor } from '../types/course.types';

/**
 * Maps a raw product from the API to our Course model.
 * Assigns a random instructor from the available pool.
 */
export function mapProductToCourse(product: RawProduct, instructor: Instructor): Course {
  const originalPrice = Math.round(product.price / (1 - product.discountPercentage / 100));
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    originalPrice,
    discountPercentage: product.discountPercentage,
    rating: product.rating,
    studentsEnrolled: product.stock * 12, // Use stock as a basis for enrolled count
    category: product.category,
    thumbnail: product.thumbnail,
    images: product.images,
    instructor,
  };
}

/**
 * Maps a raw user from the API to our Instructor model.
 */
export function mapUserToInstructor(user: RawInstructor): Instructor {
  return {
    id: user.id,
    name: `${user.name.first} ${user.name.last}`,
    email: user.email,
    avatar: user.picture.large,
    location: `${user.location.city}, ${user.location.country}`,
  };
}

/**
 * Truncates text to a given length, appending an ellipsis.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Formats a price value into a currency string.
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/**
 * Generates star rating display text.
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Formats large numbers into compact form (e.g. 1.2K, 3.4M).
 */
export function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

/**
 * Returns a category-appropriate course subject name.
 */
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    smartphones: 'Mobile Development',
    laptops: 'Computer Science',
    fragrances: 'Chemistry',
    skincare: 'Dermatology',
    groceries: 'Nutrition',
    'home-decoration': 'Interior Design',
    lighting: 'Electrical Engineering',
    automotive: 'Automotive Engineering',
    motorcycle: 'Mechanical Engineering',
    furniture: 'Woodworking',
    tops: 'Fashion Design',
    'womens-dresses': 'Fashion Design',
    'womens-shoes': 'Fashion Design',
    'mens-shirts': 'Fashion Design',
    'mens-shoes': 'Fashion Design',
    'mens-watches': 'Horology',
    'womens-watches': 'Horology',
    'womens-bags': 'Leather Craft',
    'womens-jewellery': 'Jewelry Design',
    sunglasses: 'Optics',
  };
  return labels[category] ?? 'General Studies';
}

/**
 * Delays execution for a specified duration.
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
