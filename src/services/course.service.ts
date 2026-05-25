import { apiClient } from './api';
import { RawProduct, RawInstructor, Course, Instructor } from '../types/course.types';
import { ApiResponse, PaginatedData } from '../types/api.types';
import { mapProductToCourse, mapUserToInstructor } from '../utils/helpers';
import { APP_CONFIG } from '../utils/constants';

export const courseService = {
  /**
   * Fetches courses (products) with pagination.
   * Maps raw products to Course model and assigns random instructors.
   */
  async fetchCourses(
    page: number = 1,
    limit: number = APP_CONFIG.COURSES_PER_PAGE,
    existingInstructors: Instructor[] = []
  ): Promise<{ courses: Course[]; hasMore: boolean }> {
    // Fetch products and instructors concurrently
    const [productsRes, instructorsRes] = await Promise.all([
      apiClient.get<ApiResponse<PaginatedData<RawProduct>>>(
        `/public/randomproducts?page=${page}&limit=${limit}`
      ),
      existingInstructors.length > 0
        ? Promise.resolve(null)
        : apiClient.get<ApiResponse<PaginatedData<RawInstructor>>>(
            `/public/randomusers?page=${page}&limit=${limit}`
          ),
    ]);

    const products = productsRes.data.data.data;
    const hasMore = productsRes.data.data.nextPage;

    // Build instructors array
    let instructors = existingInstructors;
    if (instructorsRes) {
      instructors = instructorsRes.data.data.data.map(mapUserToInstructor);
    }

    // Map each product to a Course, assigning an instructor round-robin
    const courses = products.map((product, index) => {
      const instructor = instructors[index % instructors.length];
      return mapProductToCourse(product, instructor);
    });

    return { courses, hasMore };
  },

  /**
   * Fetches instructors separately for display.
   */
  async fetchInstructors(
    page: number = 1,
    limit: number = 20
  ): Promise<Instructor[]> {
    const response = await apiClient.get<ApiResponse<PaginatedData<RawInstructor>>>(
      `/public/randomusers?page=${page}&limit=${limit}`
    );
    return response.data.data.data.map(mapUserToInstructor);
  },

  /**
   * Fetches a single course by ID.
   * Note: FreeAPI doesn't have single product endpoint, so we fetch page 1 and find by ID.
   */
  async fetchCourseById(id: number, instructors: Instructor[]): Promise<Course | null> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedData<RawProduct>>>(
        `/public/randomproducts?page=1&limit=100`
      );
      const product = response.data.data.data.find((p) => p.id === id);
      if (!product) return null;

      const instructor = instructors[(id - 1) % instructors.length] ?? instructors[0];
      return mapProductToCourse(product, instructor);
    } catch {
      return null;
    }
  },
};
