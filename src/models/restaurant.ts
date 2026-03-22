export interface RestaurantUnit {
  id: number;
  name: string;
}

export interface RestaurantUnitsResponse {
  restaurants: RestaurantUnit[];
}

export interface GroupCategory {
  id: string;
  name: string;
  companyId: number;
  companyName: string;
  conceptId: number;
  conceptName: string;
  permission: string;
}

export interface GroupCategoriesResponse {
  groupCategories: GroupCategory[];
}

export interface GroupUnit {
  unitId: number;
  unitName: string;
}

export interface RestaurantGroup {
  id: string;
  name: string;
  companyId: number;
  companyName: string;
  conceptId: number;
  conceptName: string;
  groupCategoryId: string | null;
  groupCategoryName: string | null;
  lastModifiedDate: string;
  units: GroupUnit[];
}

export interface GroupsResponse {
  groups: RestaurantGroup[];
}
