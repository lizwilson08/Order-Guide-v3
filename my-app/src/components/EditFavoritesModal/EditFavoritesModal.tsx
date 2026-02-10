import { useState, useMemo } from "react";
import { Modal } from "../Modal/Modal";
import { Button, Heading, Checkbox } from "../index";
import styles from "./EditFavoritesModal.module.css";

const SEARCH_ICON_SRC = "/images/icons/search.png";
const EDIT_ICON_SRC = "/images/icons/edit.png?v=2";
const CLOSE_ICON_SRC = "/images/icons/X.png";

export interface FavoriteGroupItem {
  id: string;
  ingredientName: string;
  ingredientImageUrl: string | null;
  productCount: number;
}

export interface EditFavoritesModalProps {
  open: boolean;
  onClose: () => void;
  groups: FavoriteGroupItem[];
  selectedIds: Set<string>;
  onSelectionChange: (id: string, selected: boolean) => void;
  onSave: () => void;
  onEditGroup: (id: string) => void;
  onCreateGroup: () => void;
}

export function EditFavoritesModal({
  open,
  onClose,
  groups,
  selectedIds,
  onSelectionChange,
  onSave,
  onEditGroup,
  onCreateGroup,
}: EditFavoritesModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filteredGroups = useMemo(() => {
    let list = groups;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((g) => g.ingredientName.toLowerCase().includes(q));
    }
    if (category !== "All") {
      list = list.filter((g) => g.ingredientName.toLowerCase().startsWith(category.toLowerCase()));
    }
    return list;
  }, [groups, searchQuery, category]);

  return (
    <Modal open={open} onClose={onClose} variant="partialTop" aria-label="Edit favorites">
      <div className={styles.modalContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <Button
              type="button"
              variant="secondary"
              shape="circle"
              onClick={onClose}
              aria-label="Close"
              className={styles.closeButton}
            >
              <img src={CLOSE_ICON_SRC} alt="" className={styles.closeIcon} />
            </Button>
            <Heading as="h1" className={styles.headline}>
              Edit favorites
            </Heading>
          </div>
          <div className={styles.headerActions}>
            <Button variant="secondary" onClick={onCreateGroup}>
              Create group
            </Button>
            <Button variant="primary" onClick={onSave}>
              Save
            </Button>
          </div>
        </header>

        <div className={styles.searchFilterRow}>
          <div className={styles.searchWrap}>
            <img src={SEARCH_ICON_SRC} alt="" className={styles.searchIconImg} />
            <input
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search groups"
            />
          </div>
          <div className={styles.filterButton}>
            <span className={styles.filterButtonVisual}>
              <span className={styles.filterButtonLabel}>Category</span>
              <span className={styles.filterButtonValue}>{category}</span>
            </span>
            <select
              className={styles.filterButtonSelect}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="All">All</option>
              {Array.from(
                new Set(groups.map((g) => g.ingredientName.charAt(0).toUpperCase()))
              ).sort().map((letter) => (
                <option key={letter} value={letter}>
                  {letter}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.groupList}>
          {filteredGroups.map((group) => (
            <div key={group.id} className={styles.groupRow}>
              <div className={styles.groupRowCheckbox}>
                <Checkbox
                  checked={selectedIds.has(group.id)}
                  onChange={(e) => onSelectionChange(group.id, e.target.checked)}
                  aria-label={`Select ${group.ingredientName}`}
                />
              </div>
              {group.ingredientImageUrl ? (
                <img
                  src={group.ingredientImageUrl}
                  alt=""
                  className={styles.groupThumb}
                />
              ) : (
                <div className={styles.groupThumbPlaceholder} aria-hidden />
              )}
              <div className={styles.groupInfo}>
                <span className={styles.groupName}>{group.ingredientName}</span>
                <span className={styles.productCount}>
                  {group.productCount} product{group.productCount !== 1 ? "s" : ""}
                </span>
              </div>
              <button
                type="button"
                className={styles.editGroupButton}
                onClick={() => onEditGroup(group.id)}
                aria-label={`Edit ${group.ingredientName}`}
              >
                <img src={EDIT_ICON_SRC} alt="" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
