import React from 'react'
import { IconButton } from './icon-button'
import { 
  Edit2, 
  Trash2, 
  Plus, 
  Settings, 
  Heart, 
  Share2, 
  Download,
  Star,
  ThumbsUp
} from 'lucide-react'

export function IconButtonDemo() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">IconButton Variants</h3>
        <div className="flex items-center gap-3">
          <IconButton variant="default" icon={<Plus />} tooltip="Add item" />
          <IconButton variant="secondary" icon={<Edit2 />} tooltip="Edit" />
          <IconButton variant="outline" icon={<Settings />} tooltip="Settings" />
          <IconButton variant="ghost" icon={<Share2 />} tooltip="Share" />
          <IconButton variant="destructive" icon={<Trash2 />} tooltip="Delete" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">IconButton Sizes</h3>
        <div className="flex items-center gap-3">
          <IconButton size="sm" icon={<Heart />} tooltip="Small" />
          <IconButton size="default" icon={<Heart />} tooltip="Default" />
          <IconButton size="lg" icon={<Heart />} tooltip="Large" />
          <IconButton size="xl" icon={<Heart />} tooltip="Extra Large" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">IconButton Radius</h3>
        <div className="flex items-center gap-3">
          <IconButton radius="sm" icon={<Download />} tooltip="Small radius" />
          <IconButton radius="default" icon={<Download />} tooltip="Default radius" />
          <IconButton radius="lg" icon={<Download />} tooltip="Large radius" />
          <IconButton radius="full" icon={<Download />} tooltip="Full radius" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Interactive Examples</h3>
        <div className="flex items-center gap-3">
          <IconButton 
            variant="ghost" 
            icon={<Star />} 
            tooltip="Add to favorites"
            onClick={() => alert('Added to favorites!')}
          />
          <IconButton 
            variant="outline" 
            icon={<ThumbsUp />} 
            tooltip="Like this"
            onClick={() => alert('Liked!')}
          />
          <IconButton 
            variant="destructive" 
            icon={<Trash2 />} 
            tooltip="Delete permanently"
            onClick={() => confirm('Are you sure you want to delete this?')}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Usage Examples</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <code className="block bg-muted p-2 rounded">
            {`<IconButton variant="ghost" icon={<Edit2 />} tooltip="Edit" />`}
          </code>
          <code className="block bg-muted p-2 rounded">
            {`<IconButton size="lg" radius="full" icon={<Plus />} tooltip="Add" />`}
          </code>
          <code className="block bg-muted p-2 rounded">
            {`<IconButton variant="destructive" icon={<Trash2 />} tooltip="Delete" />`}
          </code>
        </div>
      </div>
    </div>
  )
} 