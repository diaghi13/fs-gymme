<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->morphs('fileable'); // fileable_type, fileable_id (polymorphic)
            $table->string('type', 50); // medical_certificate, photo, contract, id_card, etc.
            $table->string('name'); // Original filename
            $table->string('file_name'); // Stored filename (hashed)
            $table->string('path'); // Storage path
            $table->string('disk')->default('local'); // Storage disk (local, s3, etc.)
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->nullable(); // File size in bytes
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // Additional metadata (dimensions, duration, etc.)
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('expires_at')->nullable(); // For files with expiration (e.g., certificates)
            $table->timestamps();
            $table->softDeletes();

            // Note: morphs() already creates index on fileable_type, fileable_id
            $table->index('type');
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};
