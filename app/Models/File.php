<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class File extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'fileable_type',
        'fileable_id',
        'type',
        'name',
        'file_name',
        'path',
        'disk',
        'mime_type',
        'size',
        'description',
        'metadata',
        'uploaded_by',
        'expires_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'size' => 'integer',
        'expires_at' => 'datetime',
    ];

    protected $appends = [
        'url',
        'is_expired',
        'human_readable_size',
    ];

    /**
     * Get the parent fileable model (Customer, Sale, etc.)
     */
    public function fileable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user who uploaded the file
     */
    public function uploaded_by(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get the file URL
     */
    public function getUrlAttribute(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }

    /**
     * Check if file is expired
     */
    public function getIsExpiredAttribute(): bool
    {
        if (! $this->expires_at) {
            return false;
        }

        return $this->expires_at->isPast();
    }

    /**
     * Get human readable file size
     */
    public function getHumanReadableSizeAttribute(): string
    {
        if (! $this->size) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = $this->size;
        $i = 0;

        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 2).' '.$units[$i];
    }

    /**
     * Delete file from storage when model is deleted
     */
    protected static function booted(): void
    {
        static::deleting(function (File $file) {
            if (Storage::disk($file->disk)->exists($file->path)) {
                Storage::disk($file->disk)->delete($file->path);
            }
        });
    }
}
